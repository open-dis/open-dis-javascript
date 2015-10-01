/**
 * An entity's sensor information.  Section 6.2.77.
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


dis.Sensor = function()
{
   /**  the source of the Sensor Type field  */
   this.sensorTypeSource = 0;

   /** the on/off status of the sensor */
   this.sensorOnOffStatus = 0;

   /** the sensor type and shall be represented by a 16-bit enumeration.  */
   this.sensorType = 0;

   /**  the station to which the sensor is assigned. A zero value shall indi- cate that this Sensor record is not associated with any particular station and represents the total quan- tity of this sensor for this entity. If this field is non-zero, it shall either reference an attached part or an articulated part */
   this.station = 0;

   /** quantity of the sensor  */
   this.quantity = 0;

   /** padding */
   this.padding = 0;

  dis.Sensor.prototype.initFromBinary = function(inputStream)
  {
       this.sensorTypeSource = inputStream.readUByte();
       this.sensorOnOffStatus = inputStream.readUByte();
       this.sensorType = inputStream.readUShort();
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.padding = inputStream.readUShort();
  };

  dis.Sensor.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.sensorTypeSource);
       outputStream.writeUByte(this.sensorOnOffStatus);
       outputStream.writeUShort(this.sensorType);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.Sensor = dis.Sensor;

// End of Sensor class

