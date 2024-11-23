from pydantic import BaseModel


class AddJobResponseData(BaseModel):
    job_id: str


class AddJobResponse(BaseModel):
    data: list[AddJobResponseData]


class GetResultResponseSuccessData(BaseModel):
    transcription: str


class GetResultResponseProcessingData(BaseModel):
    n_wait: int


class GetResultResponse(BaseModel):
    data: GetResultResponseSuccessData | GetResultResponseProcessingData
