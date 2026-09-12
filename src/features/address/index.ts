/** The address feature's PUBLIC API. */
export {AddressPickerScreen} from './screens/AddressPickerScreen';
export {ADDRESS_ROUTES} from './navigation/address.routes';
export type {AddressStackParamList} from './navigation/address.routes';
export {useDeliveryAddress} from './hooks/use-delivery-address';
export {formatFullAddress} from './model/types';
export type {DeliveryAddress} from './model/types';

import {useSelectedAddressStore} from './store/selected-address.store';

/** Resets the selection on sign-out (called from app/bootstrap). */
export const resetSelectedAddress = (): void =>
  useSelectedAddressStore.getState().reset();
