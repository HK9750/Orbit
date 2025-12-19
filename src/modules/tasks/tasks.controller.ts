import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { JwtAuthGuard, ApiResponseUtil, ApiResponse } from '@app/common';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post('projects/:projectId/tasks')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Param('projectId') projectId: string,
        @Body() createDto: CreateTaskDto
    ): Promise<ApiResponse<any>> {
        const result = await this.tasksService.create(projectId, createDto);
        return ApiResponseUtil.success(result, 'Task created');
    }

    @Get('projects/:projectId/tasks')
    async findAll(
        @Param('projectId') projectId: string,
        @Query() filters: TaskFilterDto,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<ApiResponse<any>> {
        const result = await this.tasksService.findAll(projectId, filters, +page || 1, +limit || 20);
        return ApiResponseUtil.success(result, 'Tasks retrieved');
    }

    @Patch('tasks/:taskId')
    async update(
        @Param('taskId') taskId: string,
        @Body() updateDto: UpdateTaskDto
    ): Promise<ApiResponse<any>> {
        const result = await this.tasksService.update(taskId, updateDto);
        return ApiResponseUtil.success(result, 'Task updated');
    }

    @Delete('tasks/:taskId')
    async remove(@Param('taskId') taskId: string): Promise<ApiResponse<any>> {
        await this.tasksService.remove(taskId);
        return ApiResponseUtil.success(null, 'Task deleted');
    }

    @Get('tasks/:taskId')
    async findOne(@Param('taskId') taskId: string): Promise<ApiResponse<any>> {
        const result = await this.tasksService.findOne(taskId);
        return ApiResponseUtil.success(result, 'Task details retrieved');
    }
}
