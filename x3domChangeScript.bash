#!/bin/bash
#
# This is a script that changes the namespace from 'dis.SomeClassName' to
# 'x3dom.dis.SomeClassName'. The x3dom authors prefer it this way. On the
# other hand, node.js and the rest are already released, and it doesn't
# make sense to change the code generator to handle this special case.
# DMcG

cp dis6.js x3domDis.js

# The x3dom object needs to have the dis object added as a property
patch x3domDis.js < x3dom.patch

# Just do a global search and replace with sed

sed -i '' "s/dis\./x3dom.dis\./g" x3domDis.js

