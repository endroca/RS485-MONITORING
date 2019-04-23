from dotenv import load_dotenv
import os

load_dotenv()
#load_dotenv(verbose=True)

if os.path.isfile('/.env'):
    env_path = '/.env'
else:
    env_path = '../../.env'

load_dotenv(dotenv_path=env_path)
