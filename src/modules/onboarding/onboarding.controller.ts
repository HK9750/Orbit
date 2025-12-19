import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { ApiResponse, ApiResponseUtil, CurrentUser, ICurrentUser, JwtAuthGuard } from '@app/common';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) { }

    @Post('invite')
    @HttpCode(HttpStatus.CREATED)
    async invite(
        @Body() inviteDto: InviteMemberDto,
        @CurrentUser() user: ICurrentUser
    ): Promise<ApiResponse<any>> {
        const result = await this.onboardingService.inviteMember(inviteDto, user.id);
        return ApiResponseUtil.success(result, 'Member invited successfully', HttpStatus.CREATED);
    }

    @Post('accept-invite')
    @HttpCode(HttpStatus.OK)
    async acceptInvite(
        @Body('token') token: string,
        @CurrentUser() user: ICurrentUser
    ): Promise<ApiResponse<any>> {
        const result = await this.onboardingService.acceptInvite(token, user.id);
        return ApiResponseUtil.success(result, 'Invite accepted', HttpStatus.OK);
    }
}
