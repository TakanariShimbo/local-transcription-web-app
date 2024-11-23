FROM nvidia/cuda:12.4.1-cudnn-devel-ubuntu22.04

WORKDIR /work

COPY ./requirements.txt /work

RUN apt-get clean && apt-get update
RUN apt-get install --no-install-recommends -y \
    git vim build-essential python3-dev python3-pip ffmpeg

ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN pip3 install --upgrade pip setuptools
RUN pip install --no-cache-dir -r requirements.txt
