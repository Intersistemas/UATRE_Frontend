import { upperCase } from 'lodash';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';



const UseKeyPress = (keys, callback, combination = null, node = null) => {
  // implement the callback ref pattern
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // handle what happens on key press
  const handleKeyPress = useCallback(
    (event) => {

      if (event.altKey && upperCase(combination).replace(' ','') == 'ALTKEY') {
        
        if (keys.some((key) => event.key === key)) {
            //callbackRef.current(event);
            callbackRef.current(event);
        }
        
      } else{
        // check if one of the key is part of the ones we want
        if (keys.some((key) => event.key === key) && combination == null) {
            //callbackRef.current(event);
            callbackRef.current(event);
        }
      }
    },
    [keys]
  );

  useEffect(() => {
    // target is either the provided node or the document
    const targetNode = node ?? document;
    // attach the event listener
    targetNode &&
      targetNode.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () =>
      targetNode &&
        targetNode.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress, node]);
}

export default UseKeyPress;