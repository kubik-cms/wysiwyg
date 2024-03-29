FROM ruby:3.1.2
MAINTAINER Bart Oleszczyk <bart@primate.co.uk>

# Update system
RUN apt-get -y update -qq
RUN apt-get install --allow-unauthenticated -y -f \
            build-essential \
            git \
            curl \
            vim \
            npm \
            rsync \
            libpq-dev \
            python-dev \
            python2.7-dev \
            imagemagick \
            libmagickcore-dev \
            libmagickwand-dev \
            postgresql-client \
            apt-transport-https \
            ruby-chunky-png \
            libv8-dev \
            libvips \
            libvips-dev \
            libvips-tools
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y -f nodejs
# Install required libraries
RUN mkdir -p /vendor/bundle

RUN gem install bundler

WORKDIR /tmp
ADD Gemfile /tmp/Gemfile
#ADD Gemfile.lock /tmp/Gemfile.lock
ADD kubik_wysiwyg.gemspec /tmp/kubik_wysiwyg.gemspec
RUN bundle install

# YARN
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get -y install yarn
RUN yarn global add node-gyp
RUN yarn install
