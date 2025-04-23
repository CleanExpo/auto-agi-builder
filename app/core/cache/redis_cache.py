"""
Redis cache module for Auto AGI Builder.

This module provides Redis-based caching functionality for improving application performance.
It includes:
- Connection pooling
- Serialization/deserialization helpers
- Cache decorators for function calls
- Cache prefix management
- Cache invalidation utilities
"""

import json
import pickle
import functools
import asyncio
import logging
import time
import hashlib
from typing import Any, Callable, Dict, List, Optional, Set, Tuple, Union
from datetime import timedelta

import redis
from redis.asyncio import Redis, ConnectionPool
from redis.exceptions import RedisError

# Configure logging
logger = logging.getLogger(__name__)

# Redis connection configuration
class RedisConfig:
    """Redis connection configuration."""
    
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: Optional[str] = None
    ssl: bool = False
    encoding: str = "utf-8"
    decode_responses: bool = False
    max_connections: int = 10
    socket_timeout: float = 5.0
    socket_connect_timeout: float = 3.0
    # Default prefix for cache keys to prevent collisions
    key_prefix: str = "auto_agi:"
    
    @classmethod
    def from_env(cls):
        """Create configuration from environment variables."""
        import os
        
        config = cls()
        config.host = os.getenv("REDIS_HOST", cls.host)
        config.port = int(os.getenv("REDIS_PORT", cls.port))
        config.db = int(os.getenv("REDIS_DB", cls.db))
        config.password = os.getenv("REDIS_PASSWORD", cls.password)
        config.ssl = os.getenv("REDIS_SSL", str(cls.ssl)).lower() in ("true", "1", "yes")
        config.max_connections = int(os.getenv("REDIS_MAX_CONNECTIONS", cls.max_connections))
        config.key_prefix = os.getenv("REDIS_KEY_PREFIX", cls.key_prefix)
        
        return config


class RedisCache:
    """Redis cache service for Auto AGI Builder."""
    
    _instance = None
    _pool = None
    
    @classmethod
    def get_instance(cls):
        """Get or create a singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self, config: Optional[RedisConfig] = None):
        """Initialize Redis cache service."""
        self.config = config or RedisConfig.from_env()
        self.serializer = JsonSerializer()
        
        # Create a Redis connection pool
        if self.__class__._pool is None:
            self.__class__._pool = self._create_connection_pool()
    
    def _create_connection_pool(self) -> ConnectionPool:
        """Create a Redis connection pool."""
        return ConnectionPool(
            host=self.config.host,
            port=self.config.port,
            db=self.config.db,
            password=self.config.password,
            ssl=self.config.ssl,
            encoding=self.config.encoding,
            decode_responses=self.config.decode_responses,
            max_connections=self.config.max_connections,
            socket_timeout=self.config.socket_timeout,
            socket_connect_timeout=self.config.socket_connect_timeout
        )
    
    async def get_redis(self) -> Redis:
        """Get a Redis client from the connection pool."""
        return Redis(connection_pool=self.__class__._pool)
    
    def get_sync_redis(self) -> redis.Redis:
        """Get a synchronous Redis client."""
        return redis.Redis(
            host=self.config.host,
            port=self.config.port,
            db=self.config.db,
            password=self.config.password,
            ssl=self.config.ssl,
            encoding=self.config.encoding,
            decode_responses=self.config.decode_responses,
            socket_timeout=self.config.socket_timeout,
            socket_connect_timeout=self.config.socket_connect_timeout
        )
    
    def prefix_key(self, key: str) -> str:
        """Add prefix to cache key."""
        return f"{self.config.key_prefix}{key}"
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get a value from cache."""
        redis_client = await self.get_redis()
        key = self.prefix_key(key)
        
        try:
            value = await redis_client.get(key)
            if value is None:
                return default
            
            return self.serializer.deserialize(value)
        except RedisError as e:
            logger.error(f"Redis error while getting key {key}: {str(e)}")
            return default
        except Exception as e:
            logger.error(f"Error deserializing cache value for key {key}: {str(e)}")
            return default
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expiration: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Set a value in cache with optional expiration."""
        redis_client = await self.get_redis()
        key = self.prefix_key(key)
        
        try:
            serialized_value = self.serializer.serialize(value)
            
            if expiration is None:
                return await redis_client.set(key, serialized_value)
            elif isinstance(expiration, timedelta):
                return await redis_client.set(key, serialized_value, px=int(expiration.total_seconds() * 1000))
            else:
                return await redis_client.set(key, serialized_value, ex=expiration)
        except RedisError as e:
            logger.error(f"Redis error while setting key {key}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error serializing value for key {key}: {str(e)}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete a key from cache."""
        redis_client = await self.get_redis()
        key = self.prefix_key(key)
        
        try:
            return await redis_client.delete(key) > 0
        except RedisError as e:
            logger.error(f"Redis error while deleting key {key}: {str(e)}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in cache."""
        redis_client = await self.get_redis()
        key = self.prefix_key(key)
        
        try:
            return await redis_client.exists(key) > 0
        except RedisError as e:
            logger.error(f"Redis error while checking existence of key {key}: {str(e)}")
            return False
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration for a key."""
        redis_client = await self.get_redis()
        key = self.prefix_key(key)
        
        try:
            return await redis_client.expire(key, seconds)
        except RedisError as e:
            logger.error(f"Redis error while setting expiration for key {key}: {str(e)}")
            return False
    
    async def clear_prefix(self, prefix: str) -> int:
        """Clear all keys with a given prefix."""
        redis_client = await self.get_redis()
        full_prefix = self.prefix_key(prefix)
        
        try:
            # Use scan to find keys with prefix
            cursor = 0
            count = 0
            
            while True:
                cursor, keys = await redis_client.scan(cursor, match=f"{full_prefix}*", count=100)
                
                if keys:
                    count += await redis_client.delete(*keys)
                
                if cursor == 0:
                    break
            
            return count
        except RedisError as e:
            logger.error(f"Redis error while clearing keys with prefix {prefix}: {str(e)}")
            return 0
    
    async def clear_all(self) -> bool:
        """Clear all keys with the service prefix."""
        try:
            return await self.clear_prefix("") > 0
        except Exception as e:
            logger.error(f"Error clearing all cache keys: {str(e)}")
            return False
    
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple values from cache."""
        if not keys:
            return {}
        
        redis_client = await self.get_redis()
        prefixed_keys = [self.prefix_key(key) for key in keys]
        
        try:
            values = await redis_client.mget(prefixed_keys)
            result = {}
            
            for i, key in enumerate(keys):
                value = values[i]
                if value is not None:
                    try:
                        result[key] = self.serializer.deserialize(value)
                    except Exception:
                        # Skip keys that can't be deserialized
                        pass
            
            return result
        except RedisError as e:
            logger.error(f"Redis error while getting multiple keys: {str(e)}")
            return {}
    
    async def set_many(
        self, 
        mapping: Dict[str, Any], 
        expiration: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Set multiple values in cache with optional expiration."""
        if not mapping:
            return True
        
        redis_client = await self.get_redis()
        prefixed_mapping = {}
        
        try:
            # Serialize all values
            for key, value in mapping.items():
                prefixed_mapping[self.prefix_key(key)] = self.serializer.serialize(value)
            
            # Set all values
            pipeline = redis_client.pipeline()
            await pipeline.mset(prefixed_mapping)
            
            # Set expiration if provided
            if expiration is not None:
                ex_seconds = expiration.total_seconds() if isinstance(expiration, timedelta) else expiration
                for key in prefixed_mapping:
                    await pipeline.expire(key, ex_seconds)
            
            await pipeline.execute()
            return True
        except RedisError as e:
            logger.error(f"Redis error while setting multiple keys: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error serializing values for multiple keys: {str(e)}")
            return False
    
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment a numeric value in cache."""
        redis_client = await self.get_redis()
        key = self.prefix_key(key)
        
        try:
            return await redis_client.incrby(key, amount)
        except RedisError as e:
            logger.error(f"Redis error while incrementing key {key}: {str(e)}")
            return None
    
    async def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """Decrement a numeric value in cache."""
        return await self.increment(key, -amount)


class JsonSerializer:
    """JSON serializer for cache values."""
    
    def serialize(self, value: Any) -> bytes:
        """Serialize value to JSON."""
        return json.dumps(value).encode("utf-8")
    
    def deserialize(self, value: bytes) -> Any:
        """Deserialize value from JSON."""
        if isinstance(value, bytes):
            value = value.decode("utf-8")
        return json.loads(value)


class PickleSerializer:
    """Pickle serializer for cache values."""
    
    def serialize(self, value: Any) -> bytes:
        """Serialize value using pickle."""
        return pickle.dumps(value)
    
    def deserialize(self, value: bytes) -> Any:
        """Deserialize value using pickle."""
        return pickle.loads(value)


# Cache decorators for performance optimization

def cached(
    key_pattern: str, 
    expiration: Optional[Union[int, timedelta]] = 300,
    cache_instance: Optional[RedisCache] = None
):
    """
    Decorator to cache function results in Redis.
    
    Args:
        key_pattern: Pattern for cache key. Can include {arg_name} placeholders.
        expiration: Cache expiration time in seconds or as timedelta.
        cache_instance: Optional custom cache instance.
    
    Example:
        @cached("user:{user_id}", 3600)
        async def get_user(user_id: int):
            return await db.get_user(user_id)
    """
    cache = cache_instance or RedisCache.get_instance()
    
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key from pattern and arguments
            bound_args = functools.signature(func).bind(*args, **kwargs)
            bound_args.apply_defaults()
            
            try:
                cache_key = key_pattern.format(**bound_args.arguments)
            except KeyError:
                # If formatting fails, use a hash of the arguments
                arg_hash = hashlib.md5(str(args).encode() + str(sorted(kwargs.items())).encode()).hexdigest()
                cache_key = f"{func.__name__}:{arg_hash}"
            
            # Check cache
            cached_value = await cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Call the function
            result = await func(*args, **kwargs)
            
            # Cache the result
            if result is not None:
                await cache.set(cache_key, result, expiration)
            
            return result
        
        # Add function to clear cache
        async def clear_cache(*args, **kwargs):
            # Build cache key from pattern and arguments
            bound_args = functools.signature(func).bind(*args, **kwargs)
            bound_args.apply_defaults()
            
            try:
                cache_key = key_pattern.format(**bound_args.arguments)
                await cache.delete(cache_key)
                return True
            except Exception as e:
                logger.error(f"Error clearing cache for {func.__name__}: {str(e)}")
                return False
        
        wrapper.clear_cache = clear_cache
        return wrapper
    
    return decorator


def rate_limited(
    key_pattern: str,
    limit: int,
    period: int,
    cache_instance: Optional[RedisCache] = None
):
    """
    Decorator to apply rate limiting to functions.
    
    Args:
        key_pattern: Pattern for rate limit key. Can include {arg_name} placeholders.
        limit: Maximum number of calls allowed in the period.
        period: Time period in seconds.
        cache_instance: Optional custom cache instance.
    
    Example:
        @rate_limited("api_call:{api_name}", 100, 60)
        async def call_external_api(api_name: str, ...):
            ...
    """
    cache = cache_instance or RedisCache.get_instance()
    
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Build rate limit key from pattern and arguments
            bound_args = functools.signature(func).bind(*args, **kwargs)
            bound_args.apply_defaults()
            
            try:
                rate_key = key_pattern.format(**bound_args.arguments)
            except KeyError:
                # If formatting fails, use a hash of the arguments
                arg_hash = hashlib.md5(str(args).encode() + str(sorted(kwargs.items())).encode()).hexdigest()
                rate_key = f"{func.__name__}:ratelimit:{arg_hash}"
            
            # Add prefix for rate limiting
            rate_key = f"ratelimit:{rate_key}"
            
            # Check rate limit
            redis_client = await cache.get_redis()
            pipe = redis_client.pipeline()
            
            # Get current count
            current_time = int(time.time())
            window_key = f"{rate_key}:{current_time // period}"
            
            count = await cache.increment(window_key)
            if count is None:
                # Redis error, proceed with caution
                logger.warning(f"Redis error in rate limiting for {func.__name__}")
                return await func(*args, **kwargs)
            
            # Set expiration if this is a new window
            if count == 1:
                await cache.expire(window_key, period * 2)  # 2x period for safety
            
            # Check if we're over the limit
            if count > limit:
                raise ValueError(f"Rate limit exceeded for {func.__name__}")
            
            # Call the function
            return await func(*args, **kwargs)
        
        return wrapper
    
    return decorator


def circuit_breaker(
    threshold: int = 5,
    timeout: int = 60,
    cache_instance: Optional[RedisCache] = None
):
    """
    Decorator that implements the circuit breaker pattern.
    
    Args:
        threshold: Number of failures before opening the circuit.
        timeout: Time in seconds to keep the circuit open.
        cache_instance: Optional custom cache instance.
    
    Example:
        @circuit_breaker(threshold=3, timeout=30)
        async def unreliable_external_service():
            ...
    """
    cache = cache_instance or RedisCache.get_instance()
    
    def decorator(func):
        circuit_key = f"circuit:{func.__module__}.{func.__name__}"
        failure_key = f"{circuit_key}:failures"
        last_failure_key = f"{circuit_key}:last_failure"
        
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Check if circuit is open
            is_open = await cache.get(circuit_key)
            
            if is_open:
                # Check if timeout has elapsed
                last_failure = await cache.get(last_failure_key)
                if last_failure and (time.time() - last_failure) < timeout:
                    raise RuntimeError(f"Circuit breaker open for {func.__name__}")
                
                # Timeout elapsed, reset the circuit
                await cache.delete(circuit_key)
                await cache.delete(failure_key)
            
            try:
                # Call the function
                result = await func(*args, **kwargs)
                
                # Success, reset failure count
                await cache.delete(failure_key)
                
                return result
            except Exception as e:
                # Record failure
                failures = await cache.increment(failure_key)
                if failures is None:
                    # Redis error, assume first failure
                    failures = 1
                    await cache.set(failure_key, failures, 60 * 60)  # 1 hour TTL
                
                # Record last failure time
                await cache.set(last_failure_key, time.time(), 60 * 60)  # 1 hour TTL
                
                # Check if threshold is reached
                if failures >= threshold:
                    # Open the circuit
                    await cache.set(circuit_key, True, timeout)
                
                # Re-raise the original exception
                raise
        
        # Add function to force circuit open or closed
        async def set_circuit_state(state: bool):
            if state:  # Open circuit
                await cache.set(circuit_key, True, timeout)
            else:  # Close circuit
                await cache.delete(circuit_key)
                await cache.delete(failure_key)
            return True
        
        wrapper.set_circuit_state = set_circuit_state
        return wrapper
    
    return decorator


# Helper function to get a Redis cache instance
def get_redis_cache() -> RedisCache:
    """Get a Redis cache instance."""
    return RedisCache.get_instance()
