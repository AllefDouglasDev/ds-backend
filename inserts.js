const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

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
  "3° MKT 'B'",
];

async function createClasses() {
  for (const className of classesToInsert) {
    await prisma.class.create({
      data: {
        name: className,
      },
    });
    console.log(`Classe ${className} inserida com sucesso.`);
  }
}

async function createStudent() {
  const email = "aluno@email.com";
  const password = "123"; // Senha não criptografada
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const classId = 1;
    const existingClass = await prisma.class.findUnique({
      where: {
        id: classId,
      },
    });
    if (!existingClass) {
      console.error("A turma de ID 1 não existe.");
      return;
    }
    const student = await prisma.user.create({
      data: {
        name: "Joao das Neves",
        email,
        password: hashedPassword, // Senha criptografada
        type: "student",
        class: {
          connect: {
            id: classId,
          },
        },
      },
    });

    console.log("Estudante criado com sucesso:", student);
  } catch (error) {
    console.error("Erro ao criar o estudante:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTeacher() {
  const email = "professor@email.com";
  const password = "123"; // Senha não criptografada
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const student = await prisma.user.create({
      data: {
        name: "Maria Aparecida",
        email,
        password: hashedPassword, // Senha criptografada
        type: "teacher",
      },
    });
    console.log("Professor criado com sucesso:", student);
  } catch (error) {
    console.error("Erro ao criar o professor:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createPrincipal() {
  const email = "diretor@email.com";
  const password = "123"; // Senha não criptografada
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const student = await prisma.user.create({
      data: {
        name: "Jorge da Silva",
        email,
        password: hashedPassword, // Senha criptografada
        type: "principal",
      },
    });
    console.log("Diretor criado com sucesso:", student);
  } catch (error) {
    console.error("Erro ao criar o diretor:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSchedule() {
  try {
    const subjects = [
      "Matemática",
      "História",
      "Português",
      "Ciências",
      "Geografia",
    ];
    const times = [
      "7:30",
      "8:20",
      "9:10",
      "9:30",
      "10:20",
      "11:10",
      "12:00",
      "13:20",
      "14:10",
      "15:00",
      "15:20",
      "16:10",
    ];
    for (let classId = 1; classId <= classesToInsert.length; classId++) {
      const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
      for (const day of days) {
        for (const time of times) {
          let subject = subjects[Math.floor(Math.random() * subjects.length)];
          if (time === "9:10" || time === "12:00" || time === "15:00") {
            subject = "Intervalo";
          }
          await prisma.schedule.create({
            data: {
              classId,
              day,
              time,
              subject,
            },
          });
        }
      }
    }
    console.log("Schedules created successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await createClasses();
  await createStudent();
  await createTeacher();
  await createPrincipal();
  await createSchedule();
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
