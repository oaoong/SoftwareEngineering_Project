from flask import Flask
from flask_pymongo import pymongo
from .config.dev import mongoURI
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

client = pymongo.MongoClient(mongoURI)
db = client.get_database('flask_mongodb_atlas')

# static폴더 접근
ALLOWED_EXTENSIONS = set(["txt","pdf","png","jpg","jpeg","gif"])
IMAGE_PATH = ".\\server\\static\\image"
app.config["IMAGE_PATH"] = IMAGE_PATH
app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024 

if not os.path.exists(app.config["IMAGE_PATH"]):
    os.mkdir(app.config["IMAGE_PATH"])

@app.route('/')
def flask_mongodb_atlas():
    return "Connected to the data base!"

if __name__ == '__main__':
    from .routes.user_route import user_api
    from .routes.product_route import product_api
    from .routes.follow_route import follow_api
    app.register_blueprint(user_api)
    app.register_blueprint(product_api)
    app.register_blueprint(follow_api)
    app.run(debug=True)
