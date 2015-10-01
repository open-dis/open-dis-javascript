if (typeof dis === "undefined")
   dis = {};
   
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

/**
 * Utility class that converts between strings and the DIS ESPDU marking
 * field. The marking field is 12 bytes long, with the first byte being
 * the character set used, and the remaining 11 bytes character codes in
 * that character set. This is often used for debugging or "billboard"
 * displays in 3D; it's intended for humans. The string character values
 * are clamped (or filled) to exactly 11 bytes, so "This is a long string"
 * will be clamped to "This is a l" (in charachter codes) and "foo" will
 * be filled to "foo\0\0\0\0\0\0\0\0".<p>
 * 
 * It is recommended that only ASCII character set (character set = 1)
 * be used.
 * 
 * @returns {undefined}
 */
dis.StringConversion = function()
{
};

/**
 * Given a string, returns a DIS marking field. The character set is set to
 * 1, for ascii. The length is clamped to 11, and zero-filled if the string
 * is shorter than 11.
 * 
 * @returns {array} disMarking field, 12 bytes long, character set = 1 (ascii) in 0, zero-filled to 11 character codes 
 */
dis.StringConversion.prototype.StringToDisMarking = function(markingString)
{
    var byteMarking = [];
    
    // character set 1 = ascii
    byteMarking.push(1);
    
    var markingLength = markingString.length;
    
    // Clamp it to 11 bytes of character data
    if(markingLength > 11)
        markingLength = 11;
    
    // If the string is shorter than 11 bytes, we zero-fill the array
    var  diff = 11 - markingLength;
    
    for(var idx = 0; idx < markingLength; idx++)
    {
        byteMarking.push(markingString.charCodeAt(idx));
    }
    
    for(var idx = markingLength; idx < 11; idx++)
    {
        byteMarking.push(0);
    }

    return byteMarking;
};

/**
 * Given a DIS marking field, returns a string. Assumes always ascii.
 * 
 * @param {array} disMarking dis marking field, [0] = character set, the rest character codes
 * @returns {string} string equivalent of the marking field
 */
dis.StringConversion.prototype.DisMarkingToString = function(disMarking)
{
    var marking = "";
    
    for(var idx = 1; idx < disMarking.length; idx++)
    {
        marking = marking + String.fromCharCode(disMarking[idx]);
    }
    
    return marking;
};
