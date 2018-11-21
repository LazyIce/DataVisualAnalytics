#!/usr/bin/python3.5

import sys
import getopt
import requests
import json
import csv
import os
import time


BASE_URL = "https://api.themoviedb.org/3"
BASE_PATH = os.getcwd() + "/"
OUTPUT_FILE1 = "movie_ID_name.csv"
OUTPUT_FILE2 = "movie_ID_sim_movie_ID.csv"


def getMyApiKey():
    my_api_key = ""
    argv = sys.argv[1:]
    try:
        opts, args = getopt.getopt(argv, "h")
    except:
        print("Command not found")
        sys.exit(2)
    for opt, arg in opts:
        if opt == "-h":
            print("You can contact me to bin.xie@gatech.edu")
    for arg in args:
        my_api_key = arg
    return my_api_key


def getComedies(my_api_key):
    comedies_top300 = []
    for i in range(1, 16):
        params = {"api_key": my_api_key,
                  "primary_release_date.gte": "2000-01-01",
                  "page": i,
                  "sort_by": "popularity.desc",
                  "with_genres": 35}
        response = requests.get(BASE_URL+"/discover/movie", params)
        comedies = response.json()["results"]
        for j in range(0, 20):
            movie_id = json.dumps(comedies[j]["id"])
            movie_name = json.dumps(comedies[j]["title"]).replace("\"", "")
            comedies_top300.append((movie_id, movie_name))
        if response.headers["X-RateLimit-Remaining"] == '0':
            interval = int(response.headers["X-RateLimit-Reset"]) - time.time() + 1
            time.sleep(interval)

    open_file = BASE_PATH + OUTPUT_FILE1
    csv_file = open(open_file, "w", newline="")
    writer = csv.writer(csv_file, delimiter=",")
    writer.writerows(comedies_top300)
    return comedies_top300


def getSimilarMovies(my_api_key, search_movies):
    similar_movies = []
    for movie in search_movies:
        params = {"api_key": my_api_key}
        response = requests.get(BASE_URL+"/movie/"+movie[0]+"/similar", params)
        similars = response.json()["results"]
        similars_num = int(json.dumps(response.json()["total_results"]))
        if similars_num < 5:
            for similar in similars:
                similar_id = json.dumps(similar["id"])
                similar_movies.append((movie[0], similar_id))
        else:
            for i in range(0, 5):
                similar_id = json.dumps(similars[i]["id"])
                if (similar_id, movie[0]) in similar_movies and movie[0] < similar_id:
                    similar_movies.remove((similar_id, movie[0]))
                    similar_movies.append((movie[0], similar_id))
                elif (similar_id, movie[0]) not in similar_movies:
                    similar_movies.append((movie[0], similar_id))
        if response.headers["X-RateLimit-Remaining"] == '0':
            interval = int(response.headers["X-RateLimit-Reset"]) - time.time() + 1
            if interval < 0:
                print("Sometimes TMDB api server time is about 30s slower than epoch time. But my code is correct.")
            else:
                time.sleep(interval)

    open_file = BASE_PATH + OUTPUT_FILE2
    csv_file = open(open_file, "w", newline="")
    writer = csv.writer(csv_file, delimiter=",")
    writer.writerows(similar_movies)


def addHeader(header):
    open_file = BASE_PATH + OUTPUT_FILE2
    with open(open_file, newline="") as f:
        reader = csv.reader(f)
        data = [line for line in reader]
    with open(open_file, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(data)


def main():
    my_api_key = getMyApiKey()
    comedies = getComedies(my_api_key)
    getSimilarMovies(my_api_key, comedies)
    addHeader(("Source", "Target"))


if __name__ == "__main__":
    main()
