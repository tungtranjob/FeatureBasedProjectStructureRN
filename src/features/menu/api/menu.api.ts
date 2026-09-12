import {http} from '@core/api/http-client';
import type {MenuDto, MenuItemDto, MenuOptionGroupDto} from '@core/api/contracts';
import {asId} from '@shared/types/id';
import type {MenuItemId, RestaurantId} from '@shared/types/id';
import {money} from '@shared/types/money';
import type {Menu, MenuItem, MenuOptionGroup} from '../model/types';

const toOptionGroup = (dto: MenuOptionGroupDto): MenuOptionGroup => ({
  id: dto.id,
  name: dto.name,
  required: dto.required,
  minSelect: dto.minSelect,
  maxSelect: dto.maxSelect,
  options: dto.options.map(option => ({
    id: option.id,
    name: option.name,
    priceDelta: money(option.priceDelta),
  })),
});

export const toMenuItem = (dto: MenuItemDto): MenuItem => ({
  id: asId<MenuItemId>(dto.id),
  restaurantId: asId<RestaurantId>(dto.restaurantId),
  categoryId: dto.categoryId,
  name: dto.name,
  description: dto.description,
  imageUrl: dto.imageUrl,
  basePrice: money(dto.basePrice),
  isAvailable: dto.isAvailable,
  soldCount: dto.soldCount,
  optionGroups: dto.optionGroups.map(toOptionGroup),
});

export const menuApi = {
  async getMenu(restaurantId: string): Promise<Menu> {
    const dto = await http.get<MenuDto>(`/restaurants/${restaurantId}/menu`);
    return {
      restaurantId: asId<RestaurantId>(dto.restaurantId),
      sections: dto.sections.map(section => ({
        categoryId: section.categoryId,
        categoryName: section.categoryName,
        items: section.items.map(toMenuItem),
      })),
    };
  },

  async getItem(itemId: string): Promise<MenuItem> {
    const dto = await http.get<MenuItemDto>(`/menu-items/${itemId}`);
    return toMenuItem(dto);
  },
};
