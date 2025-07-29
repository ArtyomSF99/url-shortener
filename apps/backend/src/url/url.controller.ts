import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
  Req,
  Patch,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { QueryParamsDto } from './dto/query-params.dto';

/**
 * Controller for URL management and redirection.
 */
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  /**
   * Get all URLs.
   */
  @Get('url')
  findAll() {
    return this.urlService.findAll();
  }

  /**
   * Create a new short URL for the authenticated user.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('url')
  create(@Body() createUrlDto: CreateUrlDto, @Req() req) {
    const userId = req.user.userId;

    return this.urlService.create(createUrlDto, userId);
  }

  /**
   * Get all URLs for the authenticated user with optional query params.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('url/my-links')
  findAllForUser(@Req() req, @Query() queryParams: QueryParamsDto) {
    const userId = req.user.userId;

    return this.urlService.findAllForUser(userId, queryParams);
  }

  /**
   * Update a URL's slug for the authenticated user.
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('url/:id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateUrlDto: UpdateUrlDto,
  ) {
    const userId = req.user.userId;

    return this.urlService.update(id, userId, updateUrlDto);
  }

  /**
   * Redirect to the original URL by slug.
   */
  @Get(':slug')
  async redirect(@Param('slug') slug: string, @Res() res: Response) {
    try {
      const originalUrl = await this.urlService.handleRedirect(slug);

      return res.redirect(302, originalUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).send('Not Found');
      }
      
      throw error;
    }
  }
}
