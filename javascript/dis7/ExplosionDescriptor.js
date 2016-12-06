/**
 * Explosion of a non-munition. Section 6.2.19.3
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


dis.ExplosionDescriptor = function()
{
   /** Type of the object that exploded. See 6.2.30 */
   this.explodingObject = new dis.EntityType(); 

   /** Material that exploded. Can be grain dust, tnt, gasoline, etc. Enumeration */
   this.explosiveMaterial = 0;

   /** padding */
   this.padding = 0;

   /** Force of explosion, in equivalent KG of TNT */
   this.explosiveForce = 0;

  dis.ExplosionDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.explodingObject.initFromBinary(inputStream);
       this.explosiveMaterial = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.explosiveForce = inputStream.readFloat32();
  };

  dis.ExplosionDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.explodingObject.encodeToBinary(outputStream);
       outputStream.writeUShort(this.explosiveMaterial);
       outputStream.writeUShort(this.padding);
       outputStream.writeFloat32(this.explosiveForce);
  };
}; // end of class

 // node.js module support
exports.ExplosionDescriptor = dis.ExplosionDescriptor;

// End of ExplosionDescriptor class

