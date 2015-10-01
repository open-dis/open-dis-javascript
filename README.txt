A Javascript implemtation of DIS that decodes IEEE 1278.1
binary data format messages and turns them into Javascript
objects.

This library is intended to be used on the client side with
the websocket receiving data. The web socket hands off an
event message with binary data attached, and the javascript
library decodes it and turns it into a javascript object.

The code also includes some simple coordinate system transforms
to change DIS world coordinates to (lat, lon, alt) or to a
position in a local tanget plane coordinate system. 

There are two XML files from which the DIS implementation is
generated: DIS1998.xml (for DIS version 6) and DIS2012.xml
(for DIS version 7). Two javascript DIS implementations are
generated, dis6.js and dis7.js.

DMcG
