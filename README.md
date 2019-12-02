# Open DIS for Javascript

<span class="badge-npmversion"><a href="https://npmjs.org/package/open-dis" title="View this project on NPM"><img src="https://img.shields.io/npm/v/open-dis.svg" alt="NPM version" /></a></span>

## Introduction

A Javascript implementation of DIS that decodes IEEE 1278.1
binary data format messages and turns them into Javascript
objects.

This library is intended to be used on the client side with
the websocket receiving data. The web socket hands off an
event message with binary data attached, and the javascript
library decodes it and turns it into a javascript object.

The code also includes some simple coordinate system transforms
to change DIS world coordinates to (lat, lon, alt) or to a
position in a local tanget plane coordinate system. 

DMcG

## Build

To generate a single `dis6.js` and `dis7.js` from the source files, run the following command:

`$ npm run prepublish`

## Examples

Example code using this library for sending and receiving DIS packets with Node.js can be found here: https://github.com/keckxde/node-disnetworkclient 
