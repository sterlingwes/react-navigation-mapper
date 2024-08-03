#!/bin/sh

set -e

pwd=$(pwd)
cd "$pwd/packages/ast" && bun tsc
cd "$pwd/packages/mapper" && bun tsc
cd "$pwd/packages/modules" && bun tsc
