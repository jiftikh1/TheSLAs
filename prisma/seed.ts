import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

const SOFTWARE_CATALOG = [
  {
    name: "Salesforce",
    slug: "salesforce",
    description:
      "Cloud-based CRM platform for sales, service, marketing, and more",
    category: "CRM",
    website: "https://www.salesforce.com",
  },
  {
    name: "HubSpot",
    slug: "hubspot",
    description:
      "Inbound marketing, sales, and service software platform",
    category: "CRM",
    website: "https://www.hubspot.com",
  },
  {
    name: "Slack",
    slug: "slack",
    description: "Team collaboration and messaging platform",
    category: "Communication",
    website: "https://slack.com",
  },
  {
    name: "Jira",
    slug: "jira",
    description: "Issue tracking and project management software",
    category: "Project Management",
    website: "https://www.atlassian.com/software/jira",
  },
  {
    name: "Tableau",
    slug: "tableau",
    description: "Data visualization and business intelligence platform",
    category: "Analytics",
    website: "https://www.tableau.com",
  },
  {
    name: "Zendesk",
    slug: "zendesk",
    description: "Customer service and support ticketing system",
    category: "Customer Support",
    website: "https://www.zendesk.com",
  },
  {
    name: "Workday",
    slug: "workday",
    description: "Enterprise cloud applications for finance and HR",
    category: "HR & Finance",
    website: "https://www.workday.com",
  },
  {
    name: "ServiceNow",
    slug: "servicenow",
    description: "Enterprise IT service management platform",
    category: "IT Service Management",
    website: "https://www.servicenow.com",
  },
  {
    name: "Marketo",
    slug: "marketo",
    description: "Marketing automation platform",
    category: "Marketing",
    website: "https://www.marketo.com",
  },
  {
    name: "Datadog",
    slug: "datadog",
    description: "Monitoring and analytics platform for cloud infrastructure",
    category: "DevOps",
    website: "https://www.datadoghq.com",
  },
];

async function main() {
  console.log("Starting database seed...");

  // Create software entries
  for (const software of SOFTWARE_CATALOG) {
    const created = await prisma.software.upsert({
      where: { slug: software.slug },
      update: {},
      create: software,
    });
    console.log(`✓ Created/Updated: ${created.name}`);
  }

  console.log("\n✓ Seed completed successfully!");
  console.log(`\nTotal software entries: ${SOFTWARE_CATALOG.length}`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
