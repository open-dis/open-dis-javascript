/**
 * Obsolete--the code generation now includes methods for accessing bit
 * fields such as this. Remains only for backward compatiblity, and I doubt
 * anyone is using it.
 * 
 * Some code to extract the entity apperance bit fields.<p>
 * 
 * The entityAppearance field in the espdu is a 32 bit integer. To save
 * space, several different fields are contained within it. 
 * Specifically:
 * 
 *  Name      bit position        Purpose
 *  ----      ------------        --------
 *  Paint            0            0 = uniform color, 1=camo
 *  Mobility         1            0 = no mobility kill, 1 = mobility kill
 *  Fire Power       2            0 = no firepower kill, 1 = firepower kill
 *  Damage           3-4          0=no damange, 1=slight, 2=moderate, 3=destroyed
 *  Smoke            5-6          0=not smoking, 1=smoke plume, 2=emitting engine smoke, 3=engine smoke + smoke plume
 *  Trailing effects 7-8          dust cloud, 0=none, 1=small, 2=medium, 3=large
 *  hatch            9-11         0=NA, 1=hatch closed, 2=popped, 3=popped + person visible, 4=open, 5=open and visible
 *  head lights      12           0=off, 1=on
 *  tail light       13           0=off, 1=on
 *  brake lights     14           0=off, 1=on
 *  flaming          15           0=none, 1=flames present
 *  launcher         16           0=not raised, 1=raised
 *  camo type        17-18        0=desert, 1=winter, 2=forest
 *  concealed        19           0=not concealed, 1=prepared concealed position (netting, etc)
 *  frozen status    20           0=not frozen, 1=frozen (in simulation terms)
 *  power plant      22           0=power plant off 1=on
 *  state            23           0=active, 1=deactivated
 *  tent             24           0=not extended 1=extended
 *  ramp             25           0=not extended, 1=extended
 *  blackout lights  26           0=off, 1=on
 *  blackout brake   27           0=off, 1=on
 *  spot lights      28           0=off, 1=on
 *  interior lights  29           0=off, 1=on
 *  unused           30-31
 *  
 *  Typical use:
 *  
 *  var entityAppearance = new DisAppearance(espdu.entityAppearance);
 *  var damage = entityAppearance.getBitfield(3, 4);
 *  
 *  This returns the "damage" bitfield in bits 3-4.
 *  
 *  var mobility = entityAppearance.getBitfield(1, 1);
 *  
 *  Returns the mobility field, 0 = no mobo kill, 1 = mobility kill
 *  
 *  @author DMcG
 **/

if (typeof dis === "undefined")
 dis = {};
 
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

/** Constructor. Takes the integer value extracted from the DIS Entity State Field appearance
 * 
 * @param {type} integerValue the entity appearance from the espdu
 * @returns {undefined}
 */
dis.DisAppearance = function(integerValue)
{
    this.entityAppearance = integerValue; 
}

/**
 * Test code for creating the correct bitmask
 * @returns {undefined}
 */
dis.DisAppearance.prototype.getTestMask = function()
{
    mask = 0;
    for(var idx = 0; idx < 7; idx++)
    {
        mask = mask + this.bit_set(mask, idx);
    }
    
    return mask;
};

/**
 * 
 * @param {integer} startPosition
 * @param {integer} finishPosition
 * @returns {integer}
 */
dis.DisAppearance.prototype.getBitField = function(startPosition, finishPosition)
{
    // do some sanity checks
    if(startPosition < 0 || startPosition > 31 || finishPosition < 0 || finishPosition > 31 || startPosition > finishPosition)
    {
        console.log("invalid start or finish for bitfield values: ", startPosition, " ", finishPosition);
        return 0;
    }
    
    // Develop the mask. Addition is equivalent to setting multiple bits.
    var mask = 0;
    for(var idx = startPosition; idx <= finishPosition; idx++)
    {
        mask = mask + this.bit_set(0, idx);
    }
        
    // do the bitmask
    var maskedValue = this.entityAppearance & mask;
    // Shift bits to get the normalized value
    var fieldValue = maskedValue >>> startPosition;  
    
    return fieldValue;
};

/** Set the "bit" position in a number to 1
 * 
 * @param {integer}  num the number whose bit we are setting. Typically zero.
 * @param {integer} bit which bit to set
 * @return {integer} the number passed in, with the "bit"th bit flipped on.
 **/
dis.DisAppearance.prototype.bit_set = function(num, bit)
{
    return num | 1<<bit;
}

exports.DisAppearance = dis.DisAppearance;

