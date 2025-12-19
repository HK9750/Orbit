import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@app/common';

export class PaginationDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(MAX_PAGE_SIZE)
    @IsOptional()
    limit?: number = DEFAULT_PAGE_SIZE;

    get skip(): number {
        return ((this.page || 1) - 1) * (this.limit || DEFAULT_PAGE_SIZE);
    }
}

export class PaginatedResponseDto<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };

    constructor(data: T[], total: number, page: number, limit: number) {
        this.data = data;
        const totalPages = Math.ceil(total / limit);
        this.meta = {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }
}
