
if (typeof dis === "undefined")
 dis = {};
 
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};
 
 /**
  * The PDU factory is responsible for decoding binary data and turning
  * it into the appropriate type of PDU.
  * 
  * The websocket will typically send the web page a IEEE 1278.1 binary
  * array of data. It could be any one of dozens of PDUs. The start of
  * all PDUs is the same--they have the same header. One of the fields in 
  * the header is the PduType, an 8 bit integer with a unqiue value for
  * each type of PDU. We have to peak at that value, decide what type
  * of PDU to create of the binary we have received, and then decode it.
  * 
  *     * @DMcG
  */
 
 dis.PduFactory = function()
 {
     
 };
 
 /**
  * decode incoming binary data and
  * return the correct type of PDU.
  * 
  * @param {type} data the IEEE 1278.1 binary data
  * @returns {Pdu} Returns an instance of some PDU, be it espdu, fire, detonation, etc. Exception if PduType not known.
  */
 dis.PduFactory.prototype.createPdu = function(data)
 {
     var asUint8Array = new Uint8Array(data);
     var pduType = asUint8Array[2];
     var inputStream = new dis.InputStream(data);
     var newPdu = null;
     
     //try
     //{
        switch(pduType)
        {
            case 1:     // entity state PDU
                newPdu = new dis.EntityStatePdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 2:     // Fire
                newPdu = new dis.FirePdu();
                newPdu.initFromBinary(inputStream);
                break; 

            case 3:     // detonation
                newPdu = new dis.DetonationPdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 4:     // Collision
                newPdu = new dis.CollisionPdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 11:    // Create entity
                newPdu = new dis.CreateEntityPdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 12:    // Remove entity
                newPdu = new dis.RemoveEntityPdu();
                newPdu.initFromBinary(inputStream);
                break;
            case 13:
                newPdu = new dis.StartResumePdu();
                newPdu.initFromBinary(inputStream);
                break;
            case 14:
                newPdu = new dis.StopFreezePdu();
                newPdu.initFromBinary(inputStream);
                break;
            case 20:    // DataPdu
                newPdu = new dis.DataPdu();
                newPdu.initFromBinary(inputStream);
                break;
            case 25:  // TransmitterPDU
                newPdu = new dis.TransmitterPdu();
                newPdu.initFromBinary(inputStream);
                break;
            case 26:
                newPdu = new dis.SignalPdu();
                newPdu.initFromBinary(inputStream);
                break;
            case 27:  // receiverPDU
                newPdu = new dis.ReceiverPdu();
                newPdu.initFromBinary(inputStream);
                break;
            default:
               throw  "PduType: " + pduType + " Unrecognized PDUType. Add PDU in dis.PduFactory.";
        }
    //}
    // This also picks up any errors decoding what we though was a "normal" PDU
    //catch(error)
    //{
    //  newPdu = null;
    //}
     
     return newPdu;
 };
 
 dis.PduFactory.prototype.getPdusFromBundle = function(data)
 {
 }


exports.PduFactory = dis.PduFactory;
