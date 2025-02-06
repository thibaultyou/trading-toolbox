export interface IBaseMapper<TInternal, TDto, TCreateDto = any, TUpdateDto = any> {
  /** Converts an internal domain object to its corresponding DTO. */
  toDto(internal: TInternal): TDto;

  /**
   * Converts an external (raw) data object to the internal domain representation.
   * (Optional, if needed.)
   */
  fromExternal?(external: any): TInternal;

  /**
   * Converts a creation DTO into a new internal domain object.
   * Accepts extra arguments if necessary.
   * (Optional, if needed.)
   */
  createFromDto?(dto: TCreateDto, ...extra: any[]): TInternal;

  /**
   * Updates an existing internal domain object with data from an update DTO.
   * (Optional, if needed.)
   */
  updateFromDto?(internal: TInternal, dto: TUpdateDto): TInternal;
}
