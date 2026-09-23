from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    
   #URL_REDIS: str
    URL_POSTGRES: str
    

    #class Config:
    #    env_file = ".env",
    #    extra="ignore"

    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding="utf-8",
        # isso ignora as outras variáveis de ambiente que não serão necessárias para a fastAPI
        extra="ignore"
    )

settings = Settings()