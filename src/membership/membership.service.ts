import { Injectable } from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {
  }

  async create(createMembershipDto: CreateMembershipDto) {
    const { price, benefits, name } = createMembershipDto;
    const result = await this.membershipRepository.createQueryBuilder()
      .insert()
      .into(Membership).values({ price, benefits, name }).returning('*').execute();

    return result.raw[0];
  }

  async findAll() {
    const result = await this.membershipRepository.createQueryBuilder('membership')
      .getMany();
    return result;
  }

  async findOne(id: number) {
    return `This action returns a #${id} restroom`;
  }

}
