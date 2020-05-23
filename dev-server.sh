#!/bin/bash
node api-proxy.js &
env AKSO_BASE="http://localhost:2577" npx webpack-dev-server
