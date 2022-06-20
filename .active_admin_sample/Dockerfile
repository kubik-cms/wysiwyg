FROM ruby:2.7-alpine

ENV APP_PATH /var/app
ENV BUNDLE_VERSION 2.1.4
ENV BUNDLE_PATH /usr/local/bundle/gems
ENV TMP_PATH /tmp/
ENV RAILS_LOG_TO_STDOUT true
ENV RAILS_PORT 3000

# copy entrypoint scripts and grant execution permissions
COPY ./dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh
RUN chmod +x /usr/local/bin/dev-entrypoint.sh

# install dependencies for application
RUN apk -U add --no-cache \
build-base \
git \
postgresql-dev \
postgresql-client \
jpegoptim \
optipng \
vips-dev \
vips \
poppler-glib \
libxml2-dev \
libxslt-dev \
imagemagick \
tzdata \
less \
nodejs \
yarn \
&& rm -rf /var/cache/apk/* \
&& mkdir -p $APP_PATH

WORKDIR $APP_PATH

RUN gem install bundler --version "$BUNDLE_VERSION" \
    && rm -rf $GEM_HOME/cache/*

# navigate to app directory

EXPOSE $RAILS_PORT

ENTRYPOINT [ "bundle", "exec" ]
