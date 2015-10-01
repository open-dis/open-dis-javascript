/**
 * represents values used in dead reckoning algorithms
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DeadReckoningParameter = function()
{
   /** enumeration of what dead reckoning algorighm to use */
   this.deadReckoningAlgorithm = 0;

   /** other parameters to use in the dead reckoning algorithm */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Linear acceleration of the entity */
   this.entityLinearAcceleration = new dis.Vector3Float(); 

   /** angular velocity of the entity */
   this.entityAngularVelocity = new dis.Vector3Float(); 

  dis.DeadReckoningParameter.prototype.initFromBinary = function(inputStream)
  {
       this.deadReckoningAlgorithm = inputStream.readUByte();
       for(var idx = 0; idx < 15; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
       this.entityLinearAcceleration.initFromBinary(inputStream);
       this.entityAngularVelocity.initFromBinary(inputStream);
  };

  dis.DeadReckoningParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.deadReckoningAlgorithm);
       for(var idx = 0; idx < 15; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
       this.entityLinearAcceleration.encodeToBinary(outputStream);
       this.entityAngularVelocity.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DeadReckoningParameter = dis.DeadReckoningParameter;

// End of DeadReckoningParameter class

