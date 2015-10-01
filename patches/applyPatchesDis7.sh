#!/bin/bash
#
# Apply patches to the generated code

# Marking.java, apply patch file to ensure character fields are exactly 11 bytes long after set operations

patch javascript/dis7/dis/EntityMarking.js patches/EntityMarking.diff
