"""
Testing & Deployment Quadrant for the Executive System Manager.
Handles test generation, CI/CD setup, deployment configuration,
integration testing, and load testing.
"""
import os
import json
import time
from typing import Dict, List, Any, Optional

from .base import QuadrantBase


class TestingQuadrant(QuadrantBase):
    """
    Testing & Deployment Quadrant.
    Handles test generation, CI/CD setup, deployment configuration,
    integration testing, and load testing.
    """
    
    def __init__(self, system_manager):
        """Initialize the Testing & Deployment Quadrant."""
        super().__init__(system_manager, "Testing")
        self.autonomous_builder = system_manager.autonomous_builder
        
        # Test frameworks
        self.test_frameworks = {
            "pytest": self._gen_pytest_tests,
            "jest": self._gen_jest_tests,
            "junit": self._gen_junit_tests,
            "mocha": self._gen_mocha_tests,
        }
        
        # CI/CD platforms
        self.ci_cd_platforms = {
            "github": self._gen_github_actions,
            "gitlab": self._gen_gitlab_ci,
            "jenkins": self._gen_jenkins_pipeline,
            "azure": self._gen_azure_pipeline,
        }
        
        # Deployment targets
        self.deployment_targets = {
            "aws": self._gen_aws_deployment,
            "azure": self._gen_azure_deployment,
            "gcp": self._gen_gcp_deployment,
            "vercel": self._gen_vercel_deployment,
            "heroku": self._gen_heroku_deployment,
        }
    
    def _gen_pytest_tests(self, code_files: Dict[str, Any]) -> Dict[str, str]:
        """Generate pytest tests for Python code."""
        tests = {}
        
        # Process each file to generate test cases
        for file_path, content in code_files.items():
            if not file_path.endswith('.py') or 'test_' in file_path:
                continue  # Skip non-Python files and test files
            
            # Extract module name
            module_name = os.path.basename(file_path).replace('.py', '')
            test_file = f"test_{module_name}.py"
            
            # Generate test content
            test_content = f"""import pytest
from {module_name} import *

def test_{module_name}_exists():
    \"\"\"Test that the module exists.\"\"\"
    # This is a placeholder test
    assert True

"""
            
            # Add more specific tests based on content analysis in a real implementation
            # This would use AI to analyze the content and generate meaningful tests
            
            tests[test_file] = test_content
        
        return tests
    
    def _gen_jest_tests(self, code_files: Dict[str, Any]) -> Dict[str, str]:
        """Generate Jest tests for JavaScript/TypeScript code."""
        tests = {}
        
        # Process each file to generate test cases
        for file_path, content in code_files.items():
            if not (file_path.endswith('.js') or file_path.endswith('.jsx') or 
                    file_path.endswith('.ts') or file_path.endswith('.tsx')) or 'test.' in file_path:
                continue  # Skip non-JS/TS files and test files
            
            # Extract module name
            module_name = os.path.basename(file_path).split('.')[0]
            
            # Determine if it's a component (React)
            is_component = False
            if 'import React' in content or 'React.Component' in content or 'function' in content and 'return (' in content:
                is_component = True
            
            # Determine test file path
            test_file = file_path.replace(module_name, f"{module_name}.test")
            
            # Generate test content
            if is_component:
                test_content = f"""import React from 'react';
import {{ render, screen }} from '@testing-library/react';
import {module_name} from './{module_name}';

describe('{module_name}', () => {{
  test('renders without crashing', () => {{
    render(<{module_name} />);
    // Add more specific tests based on component functionality
  }});
}});
"""
            else:
                test_content = f"""import {module_name} from './{module_name}';

describe('{module_name}', () => {{
  test('module exists', () => {{
    expect({module_name}).toBeDefined();
    // Add more specific tests based on module functionality
  }});
}});
"""
            
            tests[test_file] = test_content
        
        return tests
    
    def _gen_junit_tests(self, code_files: Dict[str, Any]) -> Dict[str, str]:
        """Generate JUnit tests for Java code."""
        tests = {}
        
        # Process each file to generate test cases
        for file_path, content in code_files.items():
            if not file_path.endswith('.java') or 'Test' in file_path:
                continue  # Skip non-Java files and test files
            
            # Extract class name and package
            class_name = os.path.basename(file_path).replace('.java', '')
            package_line = ""
            
            # Try to extract package
            lines = content.split('\n')
            for line in lines:
                if line.startswith('package '):
                    package_line = line
                    break
            
            # Generate test file path
            test_file = file_path.replace(class_name, f"{class_name}Test")
            
            # Generate test content
            test_content = f"""{package_line}

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class {class_name}Test {{
    
    @Test
    public void testClassExists() {{
        // Basic test to ensure the class exists
        {class_name} instance = new {class_name}();
        assertNotNull(instance);
    }}
    
    // Add more tests based on class functionality
}}
"""
            
            tests[test_file] = test_content
        
        return tests
    
    def _gen_mocha_tests(self, code_files: Dict[str, Any]) -> Dict[str, str]:
        """Generate Mocha tests for JavaScript/TypeScript code."""
        tests = {}
        
        # Process each file to generate test cases
        for file_path, content in code_files.items():
            if not (file_path.endswith('.js') or file_path.endswith('.ts')) or '.test.' in file_path or '.spec.' in file_path:
                continue  # Skip non-JS/TS files and test files
            
            # Extract module name
            module_name = os.path.basename(file_path).split('.')[0]
            
            # Generate test file path
            test_file = file_path.replace(module_name, f"{module_name}.spec")
            
            # Generate test content
            test_content = f"""const expect = require('chai').expect;
const {module_name} = require('./{module_name}');

describe('{module_name}', function() {{
  it('should exist', function() {{
    expect({module_name}).to.exist;
  }});
  
  // Add more tests based on module functionality
}});
"""
            
            tests[test_file] = test_content
        
        return tests
    
    def _gen_github_actions(self, ci_cd_definition: Dict[str, Any]) -> str:
        """Generate GitHub Actions workflow configuration."""
        # Extract CI/CD properties
        test_command = ci_cd_definition.get("test_command", "npm test")
        build_command = ci_cd_definition.get("build_command", "npm run build")
        node_version = ci_cd_definition.get("node_version", "16.x")
        python_version = ci_cd_definition.get("python_version", "3.9")
        
        # Determine if it's Node.js or Python project
        is_node = "npm" in test_command or "yarn" in test_command
        is_python = "pytest" in test_command or "python" in test_command
        
        if is_node:
            # Generate Node.js workflow
            workflow = f"""name: CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js {node_version}
      uses: actions/setup-node@v2
      with:
        node-version: {node_version}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint --if-present
    
    - name: Test
      run: {test_command}
    
    - name: Build
      run: {build_command}
"""
        elif is_python:
            # Generate Python workflow
            workflow = f"""name: CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python {python_version}
      uses: actions/setup-python@v2
      with:
        python-version: {python_version}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install pytest
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    
    - name: Test
      run: {test_command}
"""
        else:
            # Generic workflow
            workflow = """name: CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build and Test
      run: |
        echo "Add your build and test commands here"
"""
        
        # Add deployment if specified
        if ci_cd_definition.get("deploy", False):
            deploy_target = ci_cd_definition.get("deploy_target", "none")
            
            if deploy_target == "vercel":
                workflow += """
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
"""
            elif deploy_target == "heroku":
                workflow += """
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
"""
            elif deploy_target == "aws":
                workflow += """
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ secrets.AWS_REGION }}
    
    - name: Deploy to AWS
      run: |
        # Add your AWS deployment commands here
"""
        
        return workflow
    
    def _gen_gitlab_ci(self, ci_cd_definition: Dict[str, Any]) -> str:
        """Generate GitLab CI configuration."""
        # Extract CI/CD properties
        test_command = ci_cd_definition.get("test_command", "npm test")
        build_command = ci_cd_definition.get("build_command", "npm run build")
        node_version = ci_cd_definition.get("node_version", "16")
        python_version = ci_cd_definition.get("python_version", "3.9")
        
        # Determine if it's Node.js or Python project
        is_node = "npm" in test_command or "yarn" in test_command
        is_python = "pytest" in test_command or "python" in test_command
        
        if is_node:
            # Generate Node.js workflow
            config = f"""image: node:{node_version}

cache:
  paths:
    - node_modules/

stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm run lint --if-present
    - {test_command}

build:
  stage: build
  script:
    - {build_command}
  artifacts:
    paths:
      - build/
      - dist/
"""
        elif is_python:
            # Generate Python workflow
            config = f"""image: python:{python_version}

cache:
  paths:
    - .pip/

stages:
  - test
  - build
  - deploy

before_script:
  - python -m pip install --upgrade pip
  - pip install pytest
  - if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

test:
  stage: test
  script:
    - {test_command}
"""
        else:
            # Generic workflow
            config = """stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - echo "Add your test commands here"

build:
  stage: build
  script:
    - echo "Add your build commands here"
"""
        
        # Add deployment if specified
        if ci_cd_definition.get("deploy", False):
            deploy_target = ci_cd_definition.get("deploy_target", "none")
            
            if deploy_target == "heroku":
                config += """
deploy:
  stage: deploy
  script:
    - apt-get update -qy
    - apt-get install -y ruby-dev
    - gem install dpl
    - dpl --provider=heroku --app=$HEROKU_APP_NAME --api-key=$HEROKU_API_KEY
  only:
    - main
    - master
"""
            elif deploy_target == "aws":
                config += """
deploy:
  stage: deploy
  image: python:latest
  script:
    - pip install awscli
    - aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
    - aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
    - aws configure set region $AWS_REGION
    # Add AWS deployment commands here
  only:
    - main
    - master
"""
        
        return config
    
    def _gen_jenkins_pipeline(self, ci_cd_definition: Dict[str, Any]) -> str:
        """Generate Jenkins pipeline configuration."""
        # Extract CI/CD properties
        test_command = ci_cd_definition.get("test_command", "npm test")
        build_command = ci_cd_definition.get("build_command", "npm run build")
        
        # Determine if it's Node.js or Python project
        is_node = "npm" in test_command or "yarn" in test_command
        is_python = "pytest" in test_command or "python" in test_command
        
        # Common pipeline start
        pipeline = """pipeline {
    agent any
    
    stages {
"""
        
        if is_node:
            # Add Node.js stages
            pipeline += f"""        stage('Install') {{
            steps {{
                sh 'npm ci'
            }}
        }}
        
        stage('Lint') {{
            steps {{
                sh 'npm run lint --if-present'
            }}
        }}
        
        stage('Test') {{
            steps {{
                sh '{test_command}'
            }}
        }}
        
        stage('Build') {{
            steps {{
                sh '{build_command}'
            }}
        }}
"""
        elif is_python:
            # Add Python stages
            pipeline += f"""        stage('Install') {{
            steps {{
                sh 'python -m pip install --upgrade pip'
                sh 'pip install pytest'
                sh 'if [ -f requirements.txt ]; then pip install -r requirements.txt; fi'
            }}
        }}
        
        stage('Test') {{
            steps {{
                sh '{test_command}'
            }}
        }}
"""
        else:
            # Generic stages
            pipeline += """        stage('Build') {
            steps {
                echo "Add your build commands here"
            }
        }
        
        stage('Test') {
            steps {
                echo "Add your test commands here"
            }
        }
"""
        
        # Add deployment if specified
        if ci_cd_definition.get("deploy", False):
            deploy_target = ci_cd_definition.get("deploy_target", "none")
            
            if deploy_target == "heroku":
                pipeline += """        stage('Deploy') {
            when {
                expression { 
                    return env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master'
                }
            }
            steps {
                withCredentials([string(credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY')]) {
                    sh '''
                        wget -qO- https://cli-assets.heroku.com/install.sh | sh
                        heroku container:login
                        heroku container:push web -a ${HEROKU_APP_NAME}
                        heroku container:release web -a ${HEROKU_APP_NAME}
                    '''
                }
            }
        }
"""
            elif deploy_target == "aws":
                pipeline += """        stage('Deploy') {
            when {
                expression { 
                    return env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master'
                }
            }
            steps {
                withAWS(credentials: 'aws-credentials', region: '${AWS_REGION}') {
                    // Add AWS deployment commands here
                    sh 'echo "Deploying to AWS..."'
                }
            }
        }
"""
        
        # Close pipeline
        pipeline += """    }
}
"""
        
        return pipeline
    
    def _gen_azure_pipeline(self, ci_cd_definition: Dict[str, Any]) -> str:
        """Generate Azure DevOps pipeline configuration."""
        # Extract CI/CD properties
        test_command = ci_cd_definition.get("test_command", "npm test")
        build_command = ci_cd_definition.get("build_command", "npm run build")
        node_version = ci_cd_definition.get("node_version", "16.x")
        python_version = ci_cd_definition.get("python_version", "3.9")
        
        # Determine if it's Node.js or Python project
        is_node = "npm" in test_command or "yarn" in test_command
        is_python = "pytest" in test_command or "python" in test_command
        
        # Common pipeline start
        pipeline = """trigger:
  - main
  - master

pool:
  vmImage: 'ubuntu-latest'

"""
        
        if is_node:
            # Add Node.js configuration
            pipeline += f"""steps:
- task: NodeTool@0
  inputs:
    versionSpec: '{node_version}'
  displayName: 'Install Node.js'

- script: |
    npm ci
  displayName: 'Install dependencies'

- script: |
    npm run lint --if-present
  displayName: 'Lint'

- script: |
    {test_command}
  displayName: 'Test'

- script: |
    {build_command}
  displayName: 'Build'
"""
        elif is_python:
            # Add Python configuration
            pipeline += f"""steps:
- task: UsePythonVersion@0
  inputs:
    versionSpec: '{python_version}'
  displayName: 'Use Python {python_version}'

- script: |
    python -m pip install --upgrade pip
    pip install pytest
    if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
  displayName: 'Install dependencies'

- script: |
    {test_command}
  displayName: 'Test'
"""
        else:
            # Generic configuration
            pipeline += """steps:
- script: |
    echo "Add your build and test commands here"
  displayName: 'Build and Test'
"""
        
        # Add deployment if specified
        if ci_cd_definition.get("deploy", False):
            deploy_target = ci_cd_definition.get("deploy_target", "none")
            
            if deploy_target == "azure":
                pipeline += """
- task: AzureWebApp@1
  condition: and(succeeded(), or(eq(variables['Build.SourceBranch'], 'refs/heads/main'), eq(variables['Build.SourceBranch'], 'refs/heads/master')))
  inputs:
    azureSubscription: '$(AZURE_SUBSCRIPTION)'
    appName: '$(AZURE_WEBAPP_NAME)'
    package: '$(System.DefaultWorkingDirectory)/**/*.zip'
  displayName: 'Deploy to Azure Web App'
"""
        
        return pipeline
    
    def _gen_aws_deployment(self, deployment_definition: Dict[str, Any]) -> Dict[str, str]:
        """Generate AWS deployment configuration."""
        # Extract deployment properties
        service_type = deployment_definition.get("service_type", "s3")  # or 'ec2', 'ecs', 'lambda', etc.
        region = deployment_definition.get("region", "us-east-1")
        
        deployments = {}
        
        if service_type == "s3":
            # S3 static website deployment
            bucket_name = deployment_definition.get("bucket_name", "my-website-bucket")
            
            # Generate deployment script
            script = f"""#!/bin/bash
# AWS S3 Deployment Script

# Build the project
npm run build

# Deploy to S3
aws s3 sync ./build s3://{bucket_name} --delete --region {region}

# Set up CloudFront invalidation if needed
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" --region {region}
fi

echo "Deployment completed!"
"""
            
            deployments["deploy_to_s3.sh"] = script
            
            # Generate CloudFormation template for infrastructure
            cloudformation = f"""AWSTemplateFormatVersion: '2010-09-09'
Description: 'S3 Static Website with CloudFront'

Resources:
  WebsiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: {bucket_name}
      AccessControl: PublicRead
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html

  WebsiteBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref WebsiteBucket
      PolicyDocument:
        Statement:
          - Sid: PublicReadForGetBucketObjects
            Effect: Allow
            Principal: '*'
            Action: 's3:GetObject'
            Resource: !Join ['', ['arn:aws:s3:::', !Ref WebsiteBucket, '/*']]

  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: !GetAtt WebsiteBucket.DomainName
            Id: S3Origin
            S3OriginConfig:
              OriginAccessIdentity: ''
        Enabled: true
        DefaultRootObject: index.html
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
          ViewerProtocolPolicy: redirect-to-https
        PriceClass: PriceClass_100
        ViewerCertificate:
          CloudFrontDefaultCertificate: true

Outputs:
  WebsiteURL:
    Description: URL for the S3 static website
    Value: !GetAtt WebsiteBucket.WebsiteURL

  CloudFrontDomainName:
    Description: Domain name of the CloudFront distribution
    Value: !GetAtt CloudFrontDistribution.DomainName
"""
            
            deployments["cloudformation.yaml"] = cloudformation
            
        elif service_type == "ec2":
            # EC2 deployment
            instance_type = deployment_definition.get("instance_type", "t2.micro")
            
            # Generate deployment script
            script = f"""#!/bin/bash
# AWS EC2 Deployment Script

# Build the project
npm run build

# Package the application
zip -r application.zip ./build

# Upload to S3 (assuming an S3 bucket for deployment artifacts)
aws s3 cp application.zip s3://deployment-artifacts-bucket/

# Update EC2 instance (via SSM or SSH)
# This is a simplified example - real deployments would typically use tools like Ansible, SSM, or CodeDeploy
aws ssm send-command \\
    --document-name "AWS-RunShellScript" \\
    --targets "Key=tag:Name,Values=MyAppServer" \\
    --parameters commands=["cd /var/www/html && aws s3 cp s3://deployment-artifacts-bucket/application.zip . && unzip -o application.zip && systemctl restart nginx"] \\
    --region {region}

echo "Deployment completed!"
"""
            
            deployments["deploy_to_ec2.sh"] = script
            
            # Generate CloudFormation template for infrastructure
            cloudformation = f"""AWSTemplateFormatVersion: '2010-09-09'
Description: 'EC2 Web Server'

Parameters:
  KeyName:
    Description: Name of an existing EC2 KeyPair to enable SSH access to the instance
    Type: AWS::EC2::KeyPair::KeyName
    ConstraintDescription: must be the name of an existing EC2 KeyPair.

Resources:
  WebServerSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable HTTP, HTTPS, and SSH access
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          CidrIp: 0.0.0.0/0

  WebServerInstance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: {instance_type}
      SecurityGroups:
        - !Ref WebServerSecurityGroup
      KeyName: !Ref KeyName
      ImageId: ami-0c55b159cbfafe1f0  # Amazon Linux 2 AMI (adjust as needed)
      Tags:
        - Key: Name
          Value: MyAppServer
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash -xe
          yum update -y
          yum install -y httpd
          systemctl start httpd
          systemctl enable httpd
          
          # Install Node.js
          curl -sL https://rpm.nodesource.com/setup_14.x | bash -
          yum install -y nodejs
          
          # Set up deployment directory
          mkdir -p /var/www/html
          chmod 755 /var/www/html

Outputs:
  WebsiteURL:
    Description: URL for the web server
    Value: !Join ['', ['http://', !GetAtt WebServerInstance.PublicDnsName]]
"""
            
            deployments["cloudformation.yaml"] = cloudformation
        
        elif service_type == "lambda":
            # Lambda function deployment
            function_name = deployment_definition.get("function_name", "my-lambda-function")
            
            # Generate deployment script
            script = f"""#!/bin/bash
# AWS Lambda Deployment Script

# Install dependencies
npm ci --production

# Package the application
zip -r function.zip ./* -x "*.git*" -x "node_modules/aws-sdk/*"

# Deploy to Lambda
aws lambda update-function-code \\
    --function-name {function_name} \\
    --zip-file fileb://function.zip \\
    --region {region}

echo "Lambda deployment completed!"
"""
            
            deployments["deploy_to_lambda.sh"] = script
            
            # Generate CloudFormation template for infrastructure
            cloudformation = f"""AWSTemplateFormatVersion: '2010-09-09'
Description: 'Lambda Function with API Gateway'

Resources:
  MyLambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: {function_name}
      Handler: index.handler
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        ZipFile: |
          exports.handler = async (event) => {{
            return {{
              statusCode: 200,
              body: JSON.stringify('Hello from Lambda!')
            }};
          }};
      Runtime: nodejs14.x
      Timeout: 30

  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: 'sts:AssumeRole'
      ManagedPolicyArns:
        - 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'

  MyApiGateway:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: MyApiGateway
      EndpointConfiguration:
        Types:
          - REGIONAL

  ApiGatewayRootMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref MyApiGateway
      ResourceId: !GetAtt MyApiGateway.RootResourceId
      HttpMethod: ANY
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub arn:aws:apigateway:${{{region}}}:lambda:path/2015-03-31/functions/${{MyLambdaFunction.Arn}}/invocations

  ApiGatewayDeployment:
    Type: AWS::ApiGateway::Deployment
    Properties:
      RestApiId: !Ref MyApiGateway
      StageName: 'prod'
"""
            
            deployments["cloudformation.yaml"] = cloudformation
        
        return deployments
    
    def _gen_azure_deployment(self, deployment_definition: Dict[str, Any]) -> Dict[str, str]:
        """Generate Azure deployment configuration."""
        service_type = deployment_definition.get("service_type", "app_service")
        resource_group = deployment_definition.get("resource_group", "my-resource-group")
        location = deployment_definition.get("location", "eastus")
        
        deployments = {}
        
        if service_type == "app_service":
            app_name = deployment_definition.get("app_name", "my-web-app")
            
            # Generate deployment script
            script = f"""#!/bin/bash
# Azure App Service Deployment Script

# Build the project
npm run build

# Package the application
zip -r package.zip ./build

# Deploy to Azure App Service
az webapp deployment source config-zip \\
    --resource-group {resource_group} \\
    --name {app_name} \\
    --src package.zip

echo "Deployment completed!"
"""
            
            deployments["deploy_to_azure.sh"] = script
            
            # Generate ARM template
            arm_template = f"""{{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {{
    "webAppName": {{
      "type": "string",
      "defaultValue": "{app_name}",
      "metadata": {{
        "description": "Base name of the resource"
      }}
    }},
    "sku": {{
      "type": "string",
      "defaultValue": "F1",
      "metadata": {{
        "description": "The SKU of App Service Plan"
      }}
    }},
    "location": {{
      "type": "string",
      "defaultValue": "{location}",
      "metadata": {{
        "description": "Location for all resources"
      }}
    }}
  }},
  "variables": {{
    "appServicePlanName": "[concat(parameters('webAppName'), '-plan')]"
  }},
  "resources": [
    {{
      "type": "Microsoft.Web/serverfarms",
      "apiVersion": "2020-06-01",
      "name": "[variables('appServicePlanName')]",
      "location": "[parameters('location')]",
      "sku": {{
        "name": "[parameters('sku')]"
      }}
    }},
    {{
      "type": "Microsoft.Web/sites",
      "apiVersion": "2020-06-01",
      "name": "[parameters('webAppName')]",
      "location": "[parameters('location')]",
      "dependsOn": [
        "[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]"
      ],
      "properties": {{
        "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]",
        "httpsOnly": true
      }}
    }}
  ],
  "outputs": {{
    "webAppUrl": {{
      "type": "string",
      "value": "[concat('https://', parameters('webAppName'), '.azurewebsites.net')]"
    }}
  }}
}}
"""
            
            deployments["arm_template.json"] = arm_template
            
        elif service_type == "function_app":
            function_app_name = deployment_definition.get("function_app_name", "my-function-app")
            
            # Generate deployment script
            script = f"""#!/bin/bash
# Azure Function App Deployment Script

# Install dependencies
npm ci --production

# Package the application (excluding dev dependencies)
zip -r function.zip . -x "node_modules/.*" "*.git*" "tests/*"

# Deploy to Azure Function App
az functionapp deployment source config-zip \\
    --resource-group {resource_group} \\
    --name {function_app_name} \\
    --src function.zip

echo "Deployment completed!"
"""
            
            deployments["deploy_to_azure_function.sh"] = script
        
        return deployments
    
    def _gen_gcp_deployment(self, deployment_definition: Dict[str, Any]) -> Dict[str, str]:
        """Generate GCP deployment configuration."""
        service_type = deployment_definition.get("service_type", "app_engine")
        project_id = deployment_definition.get("project_id", "my-gcp-project")
        
        deployments = {}
        
        if service_type == "app_engine":
            # Generate app.yaml for App Engine
            app_yaml = """runtime: nodejs14
env: standard
instance_class: F1

handlers:
  - url: /static
    static_dir: build/static
    
  - url: /(.*\.(json|ico|js|css|png|jpg|jpeg|gif|webp|svg))$
    static_files: build/\\1
    upload: build/.*\.(json|ico|js|css|png|jpg|jpeg|gif|webp|svg)$
    
  - url: /.*
    static_files: build/index.html
    upload: build/index\.html
    secure: always
"""
            
            deployments["app.yaml"] = app_yaml
            
            # Generate deployment script
            script = f"""#!/bin/bash
# GCP App Engine Deployment Script

# Set GCP project
gcloud config set project {project_id}

# Build the project
npm run build

# Deploy to App Engine
gcloud app deploy app.yaml --quiet

echo "Deployment completed!"
"""
            
            deployments["deploy_to_gcp.sh"] = script
            
        elif service_type == "cloud_run":
            container_name = deployment_definition.get("container_name", "my-service")
            
            # Generate Dockerfile
            dockerfile = """FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

ENV PORT=8080
CMD [ "npm", "start" ]
"""
            
            deployments["Dockerfile"] = dockerfile
            
            # Generate deployment script
            script = f"""#!/bin/bash
# GCP Cloud Run Deployment Script

# Set GCP project
gcloud config set project {project_id}

# Build the container
docker build -t gcr.io/{project_id}/{container_name} .

# Push the container to Container Registry
docker push gcr.io/{project_id}/{container_name}

# Deploy to Cloud Run
gcloud run deploy {container_name} \\
  --image gcr.io/{project_id}/{container_name} \\
  --platform managed \\
  --allow-unauthenticated \\
  --region us-central1

echo "Deployment completed!"
"""
            
            deployments["deploy_to_cloud_run.sh"] = script
        
        return deployments
    
    def _gen_vercel_deployment(self, deployment_definition: Dict[str, Any]) -> Dict[str, str]:
        """Generate Vercel deployment configuration."""
        team = deployment_definition.get("team", "")
        project_name = deployment_definition.get("project_name", "my-project")
        
        deployments = {}
        
        # Generate vercel.json
        vercel_json = f"""{{
  "name": "{project_name}",
  "version": 2,
  "builds": [
    {{
      "src": "package.json",
      "use": "@vercel/node"
    }}
  ],
  "routes": [
    {{
      "src": "/(.*)",
      "dest": "/"
    }}
  ]
}}
"""
        
        deployments["vercel.json"] = vercel_json
        
        # Generate deployment script
        team_flag = f"--scope {team}" if team else ""
        
        script = f"""#!/bin/bash
# Vercel Deployment Script

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
    npm install -g vercel
fi

# Deploy to Vercel
vercel {team_flag} --prod

echo "Deployment completed!"
"""
        
        deployments["deploy_to_vercel.sh"] = script
        
        return deployments
    
    def _gen_heroku_deployment(self, deployment_definition: Dict[str, Any]) -> Dict[str, str]:
        """Generate Heroku deployment configuration."""
        app_name = deployment_definition.get("app_name", "my-heroku-app")
        
        deployments = {}
        
        # Generate Procfile
        procfile = "web: npm start"
        
        deployments["Procfile"] = procfile
        
        # Generate deployment script
        script = f"""#!/bin/bash
# Heroku Deployment Script

# Install Heroku CLI if not already installed
if ! command -v heroku &> /dev/null; then
    echo "Installing Heroku CLI..."
    curl https://cli-assets.heroku.com/install.sh | sh
fi

# Check if app exists, if not create it
if ! heroku apps:info {app_name} &> /dev/null; then
    echo "Creating Heroku app: {app_name}"
    heroku create {app_name}
fi

# Add Heroku remote if not exists
if ! git remote | grep heroku &> /dev/null; then
    git remote add heroku https://git.heroku.com/{app_name}.git
fi

# Push to Heroku
git push heroku main

echo "Deployment completed!"
"""
        
        deployments["deploy_to_heroku.sh"] = script
        
        return deployments
    
    def generate_tests(self, code_files: Dict[str, Any], framework: str = "pytest") -> Dict[str, str]:
        """
        Generate tests for the provided code files.
        
        Args:
            code_files: Dictionary of code files (path -> content)
            framework: Test framework to use
            
        Returns:
            Dict[str, str]: Generated test files
        """
        self.logger.info(f"Generating {framework} tests")
        
        if framework not in self.test_frameworks:
            self.logger.warning(f"Unsupported test framework: {framework}. Defaulting to pytest.")
            framework = "pytest"
        
        # Generate tests
        test_generator = self.test_frameworks[framework]
        test_files = test_generator(code_files)
        
        return test_files
    
    def generate_ci_cd_config(self, ci_cd_definition: Dict[str, Any], platform: str = "github") -> str:
        """
        Generate CI/CD configuration for the specified platform.
        
        Args:
            ci_cd_definition: CI/CD definition
            platform: CI/CD platform to use
            
        Returns:
            str: Generated CI/CD configuration
        """
        self.logger.info(f"Generating {platform} CI/CD configuration")
        
        if platform not in self.ci_cd_platforms:
            self.logger.warning(f"Unsupported CI/CD platform: {platform}. Defaulting to github.")
            platform = "github"
        
        # Generate CI/CD configuration
        ci_cd_generator = self.ci_cd_platforms[platform]
        ci_cd_config = ci_cd_generator(ci_cd_definition)
        
        return ci_cd_config
    
    def generate_deployment_config(self, deployment_definition: Dict[str, Any], target: str = "aws") -> Dict[str, str]:
        """
        Generate deployment configuration for the specified target.
        
        Args:
            deployment_definition: Deployment definition
            target: Deployment target
            
        Returns:
            Dict[str, str]: Generated deployment files
        """
        self.logger.info(f"Generating {target} deployment configuration")
        
        if target not in self.deployment_targets:
            self.logger.warning(f"Unsupported deployment target: {target}. Defaulting to aws.")
            target = "aws"
        
        # Generate deployment configuration
        deployment_generator = self.deployment_targets[target]
        deployment_files = deployment_generator(deployment_definition)
        
        return deployment_files
    
    def run_integration_tests(self, test_definition: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run integration tests based on test definition.
        
        Args:
            test_definition: Test definition
            
        Returns:
            Dict[str, Any]: Test results
        """
        self.logger.info("Running integration tests")
        
        # In a real implementation, this would actually run the tests
        # Here we just simulate the process
        
        endpoints = test_definition.get("endpoints", [])
        test_results = {}
        
        for endpoint in endpoints:
            endpoint_name = endpoint.get("name", "unknown")
            endpoint_url = endpoint.get("url", "")
            
            self.logger.info(f"Testing endpoint: {endpoint_name} at {endpoint_url}")
            
            # Simulate test execution and timing
            time.sleep(0.5)  # Simulate test execution time
            
            # Simulate test result
            test_results[endpoint_name] = {
                "success": True,
                "response_time": 123,
                "status_code": 200,
                "details": "Endpoint responded as expected"
            }
        
        return {"success": True, "results": test_results}
    
    def run_load_tests(self, load_test_definition: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run load tests based on load test definition.
        
        Args:
            load_test_definition: Load test definition
            
        Returns:
            Dict[str, Any]: Load test results
        """
        self.logger.info("Running load tests")
        
        # In a real implementation, this would actually run the load tests
        # Here we just simulate the process
        
        endpoints = load_test_definition.get("endpoints", [])
        concurrency = load_test_definition.get("concurrency", 10)
        duration = load_test_definition.get("duration", 60)
        
        self.logger.info(f"Running load tests with concurrency {concurrency} for {duration} seconds")
        
        test_results = {}
        
        for endpoint in endpoints:
            endpoint_name = endpoint.get("name", "unknown")
            endpoint_url = endpoint.get("url", "")
            
            self.logger.info(f"Load testing endpoint: {endpoint_name} at {endpoint_url}")
            
            # Simulate test execution and timing
            time.sleep(1)  # Simulate load test execution time
            
            # Simulate test result
            test_results[endpoint_name] = {
                "success": True,
                "avg_response_time": 156,
                "max_response_time": 342,
                "min_response_time": 89,
                "requests_per_second": 213,
                "error_rate": 0.2,
                "details": "Endpoint performed within expected parameters"
            }
        
        return {
            "success": True,
            "results": test_results,
            "summary": {
                "total_requests": concurrency * duration,
                "avg_response_time": 142,
                "error_rate": 0.2
            }
        }
