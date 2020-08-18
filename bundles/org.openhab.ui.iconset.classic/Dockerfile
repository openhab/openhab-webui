# HOW TO USE
# ----------
# This Docker container includes all tools that are required for automated compression and processing of
# openHAB icons. To start the process, run the following command in the current directory:
#
# docker run --rm -it -v ${PWD}/src/main/resources/icons:/workdir $(docker build -q .) ./.convert.sh

FROM alpine:latest

ARG PNGQUANT_URL="http://pngquant.org/pngquant-2.12.5-src.tar.gz"
ARG PNGQUANT_SHA256="3638936cf6270eeeaabcee42e10768d78e4dc07cac9310307835c1f58b140808"

# install base deps
RUN mkdir /workdir; \
    apk add --update --no-cache \
        bash \
        curl \
        librsvg \
        optipng \
        py-pip \
        python3

# install scour
RUN pip3 install scour;

# build and install pngquant
RUN mkdir tmp/pngquant-src opt/pngquant; \
    curl --output /tmp/pngquant.tar.gz -L $PNGQUANT_URL; \
    echo "$PNGQUANT_SHA256  /tmp/pngquant.tar.gz" | sha256sum -c -; \
    tar --file=/tmp/pngquant.tar.gz --extract --gzip --strip-components=1 --directory=tmp/pngquant-src; \
    apk add --update --no-cache --virtual build-dependencies alpine-sdk libpng-dev; \
    cd /tmp/pngquant-src/ && ./configure --prefix=/opt/pngquant && make && make install; \
    ln -s /opt/pngquant/bin/pngquant /usr/local/bin/pngquant; \
    apk del build-dependencies; \
    rm -rf /tmp/pngquant*

WORKDIR /workdir
VOLUME /workdir
