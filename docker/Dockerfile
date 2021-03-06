FROM adoptopenjdk/openjdk8:latest

ENV APP_VERSION 1.0.0-snapshot

WORKDIR /app

RUN apt update -q \
    && apt upgrade -q -y \
    && apt install -q -y --no-install-recommends \
        curl \
        jq \
        libvips libvips-tools \
        tar \
        xz-utils

ENV PATH "/usr/local/lib/nodejs/node-v10.16.0-linux-x64/bin:$PATH"

COPY files/* /app/binaries/
COPY healthcheck.sh .
COPY installpackage.sh .
COPY installpackageretry.sh .

# Start - Use repository/package pinning to upgrade libvips from version 8.4 to 8.6
COPY peregrine.pref /etc/apt/preferences.d/
RUN echo "deb http://archive.ubuntu.com/ubuntu/ cosmic main restricted" >> /etc/apt/sources.list \
    && echo "deb http://archive.ubuntu.com/ubuntu/ cosmic universe" >> /etc/apt/sources.list \
    && apt update \
    && apt --only-upgrade install -y libvips libvips-tools
# End 

RUN mkdir -p /usr/local/lib/nodejs \
    && tar -xf /app/binaries/node-v10.16.0-linux-x64.tar.xz -C /usr/local/lib/nodejs \
    && java -version \
    && echo $PATH \
    && echo node: $(node -v) \
    && echo npm: $(npm -v) \
    && echo npx: $(npx -v) \
    && apt-get purge -y --auto-remove && rm -rf /var/lib/apt/lists/* && rm -rf /etc/apt/sources.list.d/temp.list;

RUN npm install percli @peregrinecms/slingpackager \
    && npx percli \
    && npx percli check java \
    && npx @peregrinecms/slingpackager --version \
    && mkdir out \
    && cp binaries/*.jar out \
    && chmod a+x node_modules/percli/bin/*
RUN npx percli server register author
RUN npx percli server start author \
    && npx @peregrinecms/slingpackager upload -i binaries/base.ui.apps-1.0-SNAPSHOT.zip \
    && npx @peregrinecms/slingpackager upload -i binaries/external-1.0-SNAPSHOT.zip \
    && npx @peregrinecms/slingpackager upload -i binaries/felib.ui.apps-1.0-SNAPSHOT.zip \
    && npx @peregrinecms/slingpackager upload -i binaries/pagerender-vue.ui.apps-1.0-SNAPSHOT.zip \
    && npx @peregrinecms/slingpackager upload -i binaries/admin.sling.ui.apps-1.0-SNAPSHOT.zip \
    && npx @peregrinecms/slingpackager upload -i binaries/admin.ui.materialize-1.0-SNAPSHOT.zip \
    && npx @peregrinecms/slingpackager upload -i binaries/admin.ui.apps-1.0-SNAPSHOT.zip \
    && npx @peregrinecms/slingpackager upload -i binaries/themeclean-ui.apps-1.0-SNAPSHOT.zip \
    && sleep 10 \
    && npx percli server stop author \
    && rm -rf binaries

ENTRYPOINT npx percli server start && tail -qF sling/logs/*

HEALTHCHECK --interval=15s --retries=20 \
  CMD /app/healthcheck.sh

EXPOSE 7121
