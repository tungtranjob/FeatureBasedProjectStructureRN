import {useMemo, useState} from 'react';
import {calcLinePrice, calcUnitPrice} from '../model/calc-item-price';
import {
  buildDefaultSelection,
  toggleOption,
  validateOptionSelection,
} from '../model/validate-options';
import type {MenuItem, OptionSelection} from '../model/types';

/**
 * THE LAYER BETWEEN model/ AND THE SCREEN.
 *
 * This hook holds the temporary state of the item-customisation form and delegates EVERY
 * decision to the pure functions in model/. It contains almost no logic itself —
 * which is a good sign.
 *
 * Why the state lives here and not in Zustand: the topping selection only exists while
 * the screen is open. Leave the screen and it is gone. Putting it in a global store just
 * means remembering to clean it up, and it would leak into the next time you open it.
 */
export function useItemCustomizer(item: MenuItem | undefined) {
  const [selection, setSelection] = useState<OptionSelection>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Initialise the default selection AS SOON AS the item arrives, no useEffect needed.
  // The "derived state" trick: compare the initialised id with the current one.
  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  if (item && initializedFor !== item.id) {
    setInitializedFor(item.id);
    setSelection(buildDefaultSelection(item));
    setQuantity(1);
    setNote('');
    setHasSubmitted(false);
  }

  const errors = useMemo(
    () => (item ? validateOptionSelection(item, selection) : []),
    [item, selection],
  );

  const unitPrice = useMemo(
    () => (item ? calcUnitPrice(item, selection) : 0),
    [item, selection],
  );

  const totalPrice = useMemo(
    () => (item ? calcLinePrice(item, selection, quantity) : 0),
    [item, selection, quantity],
  );

  return {
    selection,
    quantity,
    note,
    unitPrice,
    totalPrice,
    errors,
    isValid: errors.length === 0,
    /** Only show errors AFTER the user taps add-to-cart, so the screen is not covered in red on open. */
    visibleErrors: hasSubmitted ? errors : [],

    setQuantity,
    setNote,
    markSubmitted: () => setHasSubmitted(true),
    toggle: (groupId: string, optionId: string) => {
      if (item) {
        setSelection(current => toggleOption(item, current, groupId, optionId));
      }
    },
  };
}
