"""
Summarize Schemas
Request and response models for AI summarization endpoint
"""

from pydantic import BaseModel, Field
from typing import Optional


class SummarizeRequest(BaseModel):
    """Request model for summarize endpoint"""
    
    institution_name: str = Field(..., description="Name of the institution")
    major_name: str = Field(..., description="Name of the major/program")
    tuition_fees: int = Field(..., description="Annual tuition and fees (USD)")
    earnings_year_1: Optional[int] = Field(None, description="Projected earnings year 1 post-grad (USD)")
    earnings_year_3: Optional[int] = Field(None, description="Projected earnings year 3 post-grad (USD)")
    roi: Optional[float] = Field(None, description="Return on investment (ratio)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "institution_name": "Boston University",
                "major_name": "Computer Science",
                "tuition_fees": 56000,
                "earnings_year_1": 75000,
                "earnings_year_3": 95000,
                "roi": 3.12
            }
        }


class SummarizeResponse(BaseModel):
    """Response model for summarize endpoint"""
    
    summary: str = Field(..., description="AI-generated summary of the ROI analysis")
    rating: int = Field(..., description="1-5 star rating", ge=1, le=5)
    
    class Config:
        json_schema_extra = {
            "example": {
                "summary": "Based on the financial analysis for Computer Science at Boston University, this program represents a strong investment opportunity. With annual tuition of $56,000 and projected first-year earnings of $75,000, graduates can expect a solid return on investment. The significant increase in earnings to $95,000 by year 3 demonstrates strong career growth potential in this field.",
                "rating": 4
            }
        }

