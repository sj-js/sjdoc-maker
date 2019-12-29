#!/usr/bin/env bash

#########################
# Kill Node Process
#########################
./killnode.sh

#########################
# Run Test
#########################
#npm run dev

webpack-dev-server --env.mode=development --content-base --env.docs=./sjdoc-config/*.js




