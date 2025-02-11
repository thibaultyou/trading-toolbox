export interface IBaseMapper<TInternal, TDto, TCreateDto = any, TUpdateDto = any> {
  toDto(internal: TInternal): TDto;
  fromExternal?(external: any): TInternal;
  createFromDto?(dto: TCreateDto, ...extra: any[]): TInternal;
  updateFromDto?(internal: TInternal, dto: TUpdateDto): TInternal;
}
