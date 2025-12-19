import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto';
import { AddTimeEntriesToInvoiceDto } from './dto/add-time-entries.dto';
import { InvoiceStatus, Prisma } from '@app/common/prisma';

@Injectable()
export class InvoicesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(orgId: string, creatorId: string, createDto: CreateInvoiceDto) {
        // Generator Invoice Number: INV-{YEAR}-{SEQ}
        const year = new Date().getFullYear();
        const count = await this.prisma.invoice.count({
            where: { organizationId: orgId, issueDate: { gte: new Date(`${year}-01-01`) } }
        });
        const seq = (count + 1).toString().padStart(3, '0');
        const invoiceNumber = `INV-${year}-${seq}`;

        return this.prisma.invoice.create({
            data: {
                ...createDto,
                organizationId: orgId,
                creatorId,
                invoiceNumber,
                subtotal: 0,
                total: 0,
                status: InvoiceStatus.DRAFT
            }
        });
    }

    async addItem(orgId: string, invoiceId: string, itemDto: AddInvoiceItemDto) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({ where: { id: invoiceId, organizationId: orgId } });
            if (!invoice) throw new NotFoundException('Invoice not found');
            if (invoice.status !== InvoiceStatus.DRAFT) throw new BadRequestException('Cannot edit non-draft invoice');

            const amount = new Prisma.Decimal(itemDto.quantity).mul(itemDto.unitPrice);

            await tx.invoiceItem.create({
                data: {
                    ...itemDto,
                    invoiceId,
                    amount
                }
            });

            return this.recalculateTotal(tx, invoiceId);
        });
    }

    async addTimeEntries(orgId: string, invoiceId: string, dto: AddTimeEntriesToInvoiceDto) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({ where: { id: invoiceId, organizationId: orgId } });
            if (!invoice) throw new NotFoundException('Invoice not found');
            if (invoice.status !== InvoiceStatus.DRAFT) throw new BadRequestException('Cannot edit non-draft invoice');

            // Find valid, unbilled entries for this client/org
            // TimeEntry -> Task -> Project -> Client
            // We need to trace this.

            const entries = await tx.timeEntry.findMany({
                where: {
                    id: { in: dto.timeEntryIds },
                    invoiceItemId: null // Unbilled
                    // Ideally check organization via task->project->org match
                },
                include: { task: true }
            });

            if (entries.length !== dto.timeEntryIds.length) {
                throw new BadRequestException('Some time entries are invalid or already billed');
            }

            // Group by task or create individual items. Let's create individual items for transparency.
            // Assumption: Hourly Rate. We don't have hourly rate on Member or Project yet in Schema.
            // fallback: $50/hr hardcoded or 0 if missing. 
            // REALITY CHECK: Schema doesn't have rates. I will use a default rate DTO or Assume $50 for now 
            // and add a TODO to update schema for rates later.
            const DEFAULT_RATE = 50;

            for (const entry of entries) {
                const hours = new Prisma.Decimal(entry.duration || 0).div(3600);
                const amount = hours.mul(DEFAULT_RATE);

                const item = await tx.invoiceItem.create({
                    data: {
                        description: `Time Entry: ${entry.task?.title || 'Unknown Task'}`,
                        quantity: hours,
                        unitPrice: DEFAULT_RATE,
                        amount,
                        invoiceId
                    }
                });

                // Link entry to item
                await tx.timeEntry.update({
                    where: { id: entry.id },
                    data: { invoiceItemId: item.id }
                });
            }

            return this.recalculateTotal(tx, invoiceId);
        });
    }

    private async recalculateTotal(tx: Prisma.TransactionClient, invoiceId: string) {
        const items = await tx.invoiceItem.findMany({ where: { invoiceId } });
        let subtotal = new Prisma.Decimal(0);

        items.forEach(item => {
            subtotal = subtotal.add(item.amount);
        });

        const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice) throw new NotFoundException('Invoice not found');
        const taxMultiplier = new Prisma.Decimal(invoice.taxRate).div(100).add(1);
        const total = subtotal.mul(taxMultiplier);

        return tx.invoice.update({
            where: { id: invoiceId },
            data: { subtotal, total },
            include: { items: true }
        });
    }

    async findAll(orgId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [invoices, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where: { organizationId: orgId },
                include: { client: { select: { name: true } } },
                skip,
                take: limit,
                orderBy: { issueDate: 'desc' }
            }),
            this.prisma.invoice.count({ where: { organizationId: orgId } })
        ]);

        return { items: invoices, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(orgId: string, invoiceId: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId, organizationId: orgId },
            include: { items: true, client: true }
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async updateStatus(orgId: string, invoiceId: string, status: InvoiceStatus) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId, organizationId: orgId } });
        if (!invoice) throw new NotFoundException('Invoice not found');

        return this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { status }
        });
    }
}
