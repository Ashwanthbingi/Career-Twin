#!/usr/bin/env bash
set -euo pipefail

java ${JAVA_OPTS:-} -jar target/career-twin-api-0.2.0.jar
