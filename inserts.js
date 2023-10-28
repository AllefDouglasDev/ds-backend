const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Classes a serem inseridas
const classesToInsert = [
  "1° TDS 'A'",
  "1° TDS 'B'",
  "1° MKT 'A'",
  "1° MKT 'B'",
  "2° TDS 'A'",
  "2° TDS 'B'",
  "2° MKT 'A'",
  "2° MKT 'B'",
  "3° TDS 'A'",
  "3° TDS 'B'",
  "3° MKT 'A'",
  "3° MKT 'B'"
];

async function createClasses() {
  for (const className of classesToInsert) {
    await prisma.class.create({
      data: {
        name: className,
      }
    });
    console.log(`Classe ${className} inserida com sucesso.`);
  }
}

async function createStudent() {
  const email = 'estudante@email.com';
  const password = 'secret123'; // Senha não criptografada
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const classId = 1;
    const existingClass = await prisma.class.findUnique({
      where: {
        id: classId,
      },
    });
    if (!existingClass) {
      console.error('A turma de ID 1 não existe.');
      return;
    }
    const student = await prisma.user.create({
      data: {
        name: 'Joao',
        email,
        password: hashedPassword, // Senha criptografada
        type: 'student',
        class: {
          connect: {
            id: classId,
          },
        },
      },
    });

    console.log('Estudante criado com sucesso:', student);
  } catch (error) {
    console.error('Erro ao criar o estudante:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTeacher() {
  const email = 'professor@email.com';
  const password = 'secret123'; // Senha não criptografada
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const student = await prisma.user.create({
      data: {
        name: 'Maria',
        email,
        password: hashedPassword, // Senha criptografada
        type: 'teacher',
      },
    });
    console.log('Professor criado com sucesso:', student);
  } catch (error) {
    console.error('Erro ao criar o professor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await createClasses();
  await createStudent();
  await createTeacher();
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
