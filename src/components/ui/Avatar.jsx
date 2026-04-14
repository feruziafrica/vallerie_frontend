/**
 * Avatar — initials-based circle avatar.
 *
 * Props:
 *   initials  {string}  e.g. "SM"
 *   size      {number}  diameter in px (default 48)
 *   bg        {string}  CSS colour (default amber-600)
 *   color     {string}  text colour (default white)
 */
const Avatar = ({
  initials,
  size  = 48,
  bg    = "var(--amber-600)",
  color = "white",
}) => (
  <div
    style={{
      width:          size,
      height:         size,
      borderRadius:   "50%",
      background:     bg,
      color,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      fontSize:       size * 0.33,
      fontWeight:     700,
      flexShrink:     0,
      userSelect:     "none",
    }}
  >
    {initials}
  </div>
);

export default Avatar;