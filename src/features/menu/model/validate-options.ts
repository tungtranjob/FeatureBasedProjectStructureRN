import type {MenuItem, OptionSelection} from './types';

export interface OptionValidationError {
  groupId: string;
  groupName: string;
  message: string;
}

/**
 * Checks whether an option selection is valid.
 *
 * Returns a LIST of errors rather than a boolean, because the UI needs to show the right
 * error next to the right group ("Vui lòng chọn size" right under the size group).
 * With true/false the screen can only say "something is wrong" — which is useless.
 */
export const validateOptionSelection = (
  item: MenuItem,
  selection: OptionSelection,
): OptionValidationError[] => {
  const errors: OptionValidationError[] = [];

  for (const group of item.optionGroups) {
    const selected = selection[group.id] ?? [];

    if (group.required && selected.length < Math.max(1, group.minSelect)) {
      errors.push({
        groupId: group.id,
        groupName: group.name,
        message: `Vui lòng chọn ${group.name.toLowerCase()}`,
      });
      continue;
    }

    if (selected.length > group.maxSelect) {
      errors.push({
        groupId: group.id,
        groupName: group.name,
        message: `Chỉ được chọn tối đa ${group.maxSelect} mục`,
      });
    }
  }

  return errors;
};

export const isSelectionValid = (
  item: MenuItem,
  selection: OptionSelection,
): boolean => validateOptionSelection(item, selection).length === 0;

/**
 * The default selection when the item detail screen opens.
 *
 * Required groups pre-select their first entry. That is a UX decision, and it lives in
 * model/ rather than in a component — so when the product team wants "pre-select the
 * cheapest option" instead, we change 1 function that has test coverage.
 */
export const buildDefaultSelection = (item: MenuItem): OptionSelection => {
  const selection: OptionSelection = {};
  for (const group of item.optionGroups) {
    const firstOption = group.options[0];
    selection[group.id] = group.required && firstOption ? [firstOption.id] : [];
  }
  return selection;
};

/**
 * Toggles an option, respecting the group's constraints.
 *
 * - Single-select group (maxSelect = 1): picking a new one replaces the old one.
 * - Multi-select group: tap to toggle, but blocked once maxSelect is reached.
 * - Required group: the last selected entry cannot be deselected.
 */
export const toggleOption = (
  item: MenuItem,
  selection: OptionSelection,
  groupId: string,
  optionId: string,
): OptionSelection => {
  const group = item.optionGroups.find(g => g.id === groupId);
  if (!group) {
    return selection;
  }

  const current = selection[groupId] ?? [];
  const isSelected = current.includes(optionId);

  if (group.maxSelect === 1) {
    // Deselecting the only entry of a required group -> not allowed.
    if (isSelected && group.required) {
      return selection;
    }
    return {...selection, [groupId]: isSelected ? [] : [optionId]};
  }

  if (isSelected) {
    return {...selection, [groupId]: current.filter(id => id !== optionId)};
  }

  if (current.length >= group.maxSelect) {
    return selection; // already at the limit, ignore the tap
  }

  return {...selection, [groupId]: [...current, optionId]};
};
