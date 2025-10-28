import { makeChart, renderText } from "@zwds/core";
import * as readline from "readline";

// 解析命令行参数
const args = new Map<string, string>();
let startIndex = 2;
if (process.argv[2] === "--") {
  startIndex = 3;
}

for (let i = startIndex; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) {
    const key = arg.replace(/^--/, "");
    const value = process.argv[i + 1];
    if (value && !value.startsWith("--")) {
      args.set(key, value);
      i++;
    }
  }
}

// 验证性别参数
function validateSex(input: string | undefined): "male" | "female" | null {
  if (!input) return null;
  const normalized = input.toLowerCase();
  if (normalized === "male" || input === "男") return "male";
  if (normalized === "female" || input === "女") return "female";
  return null;
}

// 验证日期时间参数
function validateSolar(input: string | undefined): string | null {
  if (!input) return null;
  // 接受格式: YYYY-MM-DDTHH:mm:ss 或 YYYY-MM-DD HH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input)) {
    return input;
  }
  return null;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  let sex: "male" | "female" | null = null;
  let solar: string | null = null;

  // 尝试从命令行读取性别
  const cmdSex = validateSex(args.get("sex"));
  if (cmdSex) {
    sex = cmdSex;
  } else if (args.has("sex")) {
    console.log("警告：命令行提供的性别参数无效");
  }

  // 尝试从命令行读取日期时间
  const cmdSolar = validateSolar(args.get("solar"));
  if (cmdSolar) {
    solar = cmdSolar;
  } else if (args.has("solar")) {
    console.log("警告：命令行提供的日期时间参数无效");
  }

  // 如果参数都有效，直接生成命盘
  if (sex && solar) {
    rl.close();
    try {
      const chart = makeChart({ sex, solar });
      console.log(renderText(chart));
      return;
    } catch (error) {
      console.error("生成命盘时发生错误:", error);
      process.exit(1);
    }
  }

  // 否则进入交互模式补充缺失的参数
  console.log("欢迎使用紫微斗数排盘系统\n");

  // 如果性别缺失或无效，询问
  if (!sex) {
    while (true) {
      const sexInput = await question("请输入性别 (男/女 或 male/female): ");
      const validatedSex = validateSex(sexInput);
      if (validatedSex) {
        sex = validatedSex;
        break;
      } else {
        console.log("请输入有效的性别（男/女 或 male/female）");
      }
    }
  }

  // 如果日期时间缺失或无效，询问
  if (!solar) {
    let date = "";
    while (true) {
      const dateInput = await question("请输入出生日期 (格式: YYYY-MM-DD, 例如 1984-09-19): ");
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        date = dateInput;
        break;
      } else {
        console.log("请输入有效的日期格式 (YYYY-MM-DD)");
      }
    }

    let time = "";
    while (true) {
      const timeInput = await question("请输入出生时间 (格式: HH:mm, 例如 06:00): ");
      if (/^\d{2}:\d{2}$/.test(timeInput)) {
        time = timeInput;
        break;
      } else {
        console.log("请输入有效的时间格式 (HH:mm)");
      }
    }

    solar = `${date}T${time}:00`;
  }

  rl.close();

  console.log("\n正在生成命盘...\n");

  try {
    const chart = makeChart({ sex, solar });
    console.log(renderText(chart));
  } catch (error) {
    console.error("生成命盘时发生错误:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("程序执行错误:", error);
  process.exit(1);
});