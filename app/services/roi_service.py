import math
import uuid
from datetime import date, datetime
from typing import Dict, List, Optional, Tuple, Any

import numpy as np
from dateutil.relativedelta import relativedelta

from app.schemas.roi import (
    BenefitItem,
    CostItem,
    ProjectParameters,
    ROICalculationResult,
    ROIInput,
    ROIOutput,
    ROITimelineItem,
)


class ROICalculationService:
    """Service for calculating ROI metrics"""

    @staticmethod
    def _calculate_monthly_value(
        value: float, frequency: Optional[str], recurring: bool
    ) -> float:
        """Convert a value to its monthly equivalent based on frequency"""
        if not recurring:
            return 0  # Non-recurring items are handled separately

        if frequency == "monthly":
            return value
        elif frequency == "quarterly":
            return value / 3
        elif frequency == "yearly":
            return value / 12
        else:
            return 0  # Default to 0 if frequency is not recognized

    @staticmethod
    def _calculate_npv(cash_flows: List[float], discount_rate: float) -> float:
        """Calculate Net Present Value"""
        npv = 0
        monthly_rate = discount_rate / 12  # Convert annual rate to monthly
        
        for i, cf in enumerate(cash_flows):
            npv += cf / ((1 + monthly_rate) ** i)
            
        return npv

    @staticmethod
    def _calculate_irr(cash_flows: List[float]) -> Optional[float]:
        """Calculate Internal Rate of Return"""
        try:
            # Convert to numpy array for computation
            cf_array = np.array(cash_flows)
            
            # Use numpy's financial function to calculate IRR
            # Multiply by 12 to convert monthly rate to annual
            irr = np.irr(cf_array) * 12
            
            # IRR might not be calculable in all scenarios
            if math.isnan(irr):
                return None
                
            return irr
        except:
            return None

    @staticmethod
    def _calculate_payback_period(cumulative_cash_flows: List[float]) -> Optional[float]:
        """Calculate Payback Period in months"""
        if not cumulative_cash_flows:
            return None
            
        # If never reaching positive, no payback period
        if all(cf < 0 for cf in cumulative_cash_flows):
            return None
            
        # Find the first period with positive cumulative cash flow
        for i, cf in enumerate(cumulative_cash_flows):
            if cf >= 0:
                # If it's the first period, return it
                if i == 0:
                    return 0
                
                # Interpolate for more accurate payback period
                # Calculate how far into the period the payback occurs
                prev_cf = cumulative_cash_flows[i-1]
                proportion = abs(prev_cf) / abs(cf - prev_cf)
                
                return i - 1 + proportion
                
        return None

    @staticmethod
    def _generate_chart_data(
        timeline: List[ROITimelineItem], 
        parameters: ProjectParameters
    ) -> Dict[str, Any]:
        """Generate chart data for visualization"""
        chart_data = {
            "labels": [],  # Periods or dates
            "series": {
                "costs": [],
                "benefits": [],
                "netCashFlow": [],
                "cumulativeCashFlow": []
            }
        }
        
        # Use dates if available, otherwise use period numbers
        use_dates = all(item.date is not None for item in timeline)
        
        for item in timeline:
            # Add label
            if use_dates and item.date:
                # Format date as YYYY-MM
                chart_data["labels"].append(item.date.strftime("%Y-%m"))
            else:
                chart_data["labels"].append(f"Month {item.period}")
                
            # Add series data
            total_costs = sum(item.costs.values())
            total_benefits = sum(item.benefits.values())
            
            chart_data["series"]["costs"].append(total_costs)
            chart_data["series"]["benefits"].append(total_benefits)
            chart_data["series"]["netCashFlow"].append(item.net_cash_flow)
            chart_data["series"]["cumulativeCashFlow"].append(item.cumulative_cash_flow)
            
        # Add summary data
        chart_data["summary"] = {
            "timeline_months": parameters.timeline_months,
            "currency": parameters.currency,
        }
            
        return chart_data

    def calculate_roi(self, input_data: ROIInput) -> ROIOutput:
        """
        Calculate ROI metrics based on input data
        
        Args:
            input_data: ROI input data including costs and benefits
            
        Returns:
            ROI calculation results
        """
        # Initialize timeline
        timeline: List[ROITimelineItem] = []
        
        # Generate dates if start date is provided
        dates = None
        if input_data.parameters.start_date:
            dates = []
            start_date = input_data.parameters.start_date
            for i in range(input_data.parameters.timeline_months):
                dates.append(start_date + relativedelta(months=i))
        
        # Calculate one-time costs and benefits
        one_time_costs: Dict[str, float] = {}
        one_time_benefits: Dict[str, float] = {}
        
        for cost in input_data.costs:
            if not cost.recurring:
                cost_id = cost.id or str(uuid.uuid4())
                one_time_costs[cost_id] = cost.amount
                
        for benefit in input_data.benefits:
            if not benefit.recurring:
                benefit_id = benefit.id or str(uuid.uuid4())
                one_time_benefits[benefit_id] = benefit.value * benefit.probability
        
        # Calculate monthly recurring costs and benefits
        monthly_costs: Dict[str, float] = {}
        monthly_benefits: Dict[str, Dict[str, float]] = {}  # Keyed by month to realize
        
        for cost in input_data.costs:
            if cost.recurring and cost.frequency:
                cost_id = cost.id or str(uuid.uuid4())
                monthly_costs[cost_id] = self._calculate_monthly_value(
                    cost.amount, cost.frequency, cost.recurring
                )
                
        for benefit in input_data.benefits:
            if benefit.recurring and benefit.frequency:
                benefit_id = benefit.id or str(uuid.uuid4())
                realize_month = benefit.time_to_realize
                
                if realize_month not in monthly_benefits:
                    monthly_benefits[realize_month] = {}
                    
                monthly_benefits[realize_month][benefit_id] = (
                    self._calculate_monthly_value(
                        benefit.value, benefit.frequency, benefit.recurring
                    ) * benefit.probability
                )
        
        # Calculate cash flows for each period
        cash_flows = []
        cumulative_cash_flow = 0
        realized_monthly_benefits: Dict[str, float] = {}
        
        for period in range(input_data.parameters.timeline_months):
            period_costs = monthly_costs.copy()
            period_benefits = realized_monthly_benefits.copy()
            
            # Add one-time costs and benefits at period 0
            if period == 0:
                period_costs.update(one_time_costs)
                
            # Add one-time benefits when they're realized
            for benefit in input_data.benefits:
                if not benefit.recurring and period == benefit.time_to_realize:
                    benefit_id = benefit.id or str(uuid.uuid4())
                    period_benefits[benefit_id] = benefit.value * benefit.probability
            
            # Add newly realized monthly benefits
            if period in monthly_benefits:
                realized_monthly_benefits.update(monthly_benefits[period])
                period_benefits.update(monthly_benefits[period])
            
            # Calculate net cash flow
            total_costs = sum(period_costs.values())
            total_benefits = sum(period_benefits.values())
            net_cash_flow = total_benefits - total_costs
            
            # Apply discount factor
            discount_factor = (1 + input_data.parameters.discount_rate / 12) ** period
            discounted_cash_flow = net_cash_flow / discount_factor
            
            # Update cumulative cash flow
            cumulative_cash_flow += discounted_cash_flow
            
            # Add to cash flows list for NPV and IRR calculations
            if period == 0:
                # Initial investment is negative cash flow
                initial_investment = -total_costs
                cash_flows.append(initial_investment)
            else:
                cash_flows.append(net_cash_flow)
            
            # Create timeline item
            timeline_item = ROITimelineItem(
                period=period,
                date=dates[period] if dates else None,
                costs=period_costs,
                benefits=period_benefits,
                net_cash_flow=net_cash_flow,
                discounted_cash_flow=discounted_cash_flow,
                cumulative_cash_flow=cumulative_cash_flow
            )
            
            timeline.append(timeline_item)
        
        # Calculate summary metrics
        npv = self._calculate_npv(
            cash_flows, input_data.parameters.discount_rate
        )
        
        # Calculate IRR
        irr = self._calculate_irr(cash_flows)
        
        # Calculate payback period
        cumulative_cash_flows = [item.cumulative_cash_flow for item in timeline]
        payback_period = self._calculate_payback_period(cumulative_cash_flows)
        
        # Calculate total costs, benefits, and ROI
        total_costs = sum(sum(item.costs.values()) for item in timeline)
        total_benefits = sum(sum(item.benefits.values()) for item in timeline)
        
        net_benefit = total_benefits - total_costs
        
        # ROI formula: (Net Benefit / Total Cost) * 100
        if total_costs > 0:
            roi_percentage = (net_benefit / total_costs) * 100
        else:
            roi_percentage = float('inf')  # Infinite ROI if no costs
            
        # Benefit-cost ratio
        if total_costs > 0:
            benefit_cost_ratio = total_benefits / total_costs
        else:
            benefit_cost_ratio = float('inf')
        
        # Generate chart data
        chart_data = self._generate_chart_data(timeline, input_data.parameters)
        
        # Create result object
        calculation_result = ROICalculationResult(
            roi_percentage=roi_percentage,
            net_present_value=npv,
            payback_period_months=payback_period,
            internal_rate_of_return=irr,
            benefit_cost_ratio=benefit_cost_ratio,
            total_costs=total_costs,
            total_benefits=total_benefits,
            net_benefit=net_benefit,
            timeline=timeline,
            chart_data=chart_data
        )
        
        # Create output object
        output = ROIOutput(
            id=str(uuid.uuid4()),
            project_id=input_data.project_id,
            name=input_data.name,
            description=input_data.description,
            parameters=input_data.parameters,
            costs=input_data.costs,
            benefits=input_data.benefits,
            results=calculation_result,
            created_at=date.today(),
            updated_at=date.today()
        )
        
        return output
