#!/bin/sh

set -e

echo "Environment: $RAILS_ENV"

# install missing gems
echo 'bundle check'
bundle check || bundle install
echo 'bundle checked'

# Remove pre-existing puma/passenger server.pid
rm -f $APP_PATH/tmp/pids/server.pid

# run passed commands
bundle exec ${@}

