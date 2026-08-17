var e=`---
id: ch3
title: 栈和队列
order: 3
---

## 栈的定义与存储结构
<!-- sec: ch3-s1 -->

### 栈的定义与基本操作
<!-- kp: ch3-s1-k1 emphasis: key -->

## 栈的定义

**栈（Stack）**是只允许在**一端**（栈顶 top）进行插入和删除操作的线性表，因而又称**后进先出（LIFO, Last In First Out）**的线性表。允许插入和删除的一端称为**栈顶**，另一端称为**栈底**（bottom）。栈中没有元素时称为**空栈**。栈的插入操作称为**入栈（Push）**，删除操作称为**出栈（Pop）**。

栈的数学性质：若入栈序列为 $$a_1,a_2,\\ldots,a_n$$，则出栈序列可以是任意以 $$a_1$$ 开头的排列吗？——不是。**只要 $$i<j<k$$，则出栈序列中不可能出现 $$a_k, a_i, a_j$$ 的相对顺序（即较大的元素不能先于两个较小元素之间的中间元素出栈）**。等价地：出栈序列中，若某元素后面有比它小的元素，则这些元素必须按**从大到小**的顺序排列。判断给定序列是否为合法出栈序列是 408 选择题常考点（可用栈模拟验证）。

## 基本操作

\`\`\`c
InitStack(&S)      // 初始化空栈
StackEmpty(S)      // 判栈空
Push(&S, x)        // 入栈
Pop(&S, &x)        // 出栈，用 x 返回
GetTop(S, &x)      // 读栈顶元素（不删除）
DestroyStack(&S)   // 销毁栈
\`\`\`

**重点：**栈是操作受限的线性表，其逻辑结构仍为线性结构，只是限制了操作位置；栈的"先进后出"特性使其天然适合处理"嵌套/回溯"类问题。

### 顺序栈的存储与实现
<!-- kp: ch3-s1-k2 emphasis: key -->

## 顺序栈

顺序栈用一段连续空间存储栈元素，用 top 指示栈顶位置。

\`\`\`c
#define MaxSize 50
typedef struct {
    ElemType data[MaxSize];
    int top;              // 栈顶指针
} SqStack;
\`\`\`

约定 **top 指向栈顶元素**时：初始化 \`top = -1\`；入栈：\`data[++top] = x\`；出栈：\`x = data[top--]\`；判空：\`top == -1\`；判满：\`top == MaxSize-1\`。另一种约定 top 指向栈顶元素的**下一个位置**：初始化 \`top = 0\`，入栈 \`data[top++] = x\`，出栈 \`x = data[--top]\`，判空 \`top == 0\`。

\`\`\`c
bool Push(SqStack &S, ElemType x) {
    if (S.top == MaxSize - 1) return false;  // 栈满
    S.data[++S.top] = x;
    return true;
}
bool Pop(SqStack &S, ElemType &x) {
    if (S.top == -1) return false;           // 栈空
    x = S.data[S.top--];
    return true;
}
\`\`\`

## 共享栈

为充分利用空间，可在一个数组两端分别设置两个栈的栈底，两个栈共享同一数组空间，**两个栈顶向中间靠拢**。共享栈判满条件为"**top0 + 1 == top1**"（即两个栈顶相邻）。共享栈降低了一个栈空间溢出而另一个栈大量空闲的可能。

**重点：**顺序栈入栈/出栈均为 O(1)。注意不同教材对 top 的初始约定不同，做题时需根据题目给定约定（top 指向栈顶元素 or 栈顶元素的下一个位置）判断栈空栈满条件。

### 链栈的实现
<!-- kp: ch3-s1-k3 -->

## 链栈

**链栈**采用带头结点的单链表实现，以链表头作为栈顶。入栈（头插）与出栈（删首元结点）都在表头进行，时间复杂度 O(1)，且**不存在栈满问题**（除非内存耗尽）。

\`\`\`c
typedef struct Linknode {
    ElemType data;
    struct Linknode *next;
} *LiStack;

bool Push(LiStack &S, ElemType x) {
    Linknode *s = (Linknode*)malloc(sizeof(Linknode));
    if (s == NULL) return false;
    s->data = x;
    s->next = S->next;   // 头插
    S->next = s;
    return true;
}
bool Pop(LiStack &S, ElemType &x) {
    if (S->next == NULL) return false;  // 栈空
    Linknode *q = S->next;
    x = q->data;
    S->next = q->next;
    free(q);
    return true;
}
\`\`\`

链栈的判空条件为 \`S->next == NULL\`。对于带头结点的链栈，入栈时始终在头结点之后插入；若不带头结点，则入栈需修改头指针。

**重点：**链栈适用于"栈的大小无法预估"的场景，代价是每个结点多一个指针域。链栈与单链表的唯一区别是**只允许在栈顶（表头）操作**。

## 栈的应用
<!-- sec: ch3-s2 -->

### 括号匹配
<!-- kp: ch3-s2-k1 emphasis: key -->

## 括号匹配算法

用栈实现括号匹配的规则：遍历表达式，遇**左括号入栈**，遇**右括号**则检查栈顶——若栈顶是对应的左括号则出栈（匹配成功），否则匹配失败；遍历结束后栈为空则所有括号匹配成功，否则失败。

\`\`\`c
bool check(char str[], int n) {
    SqStack S; InitStack(S);
    for (int i = 0; i < n; i++) {
        if (str[i] == '(' || str[i] == '[' || str[i] == '{')
            Push(S, str[i]);                    // 左括号入栈
        else {
            if (StackEmpty(S)) return false;    // 右括号无左括号配对
            char top; Pop(S, top);
            if (str[i] == ')' && top != '(') return false;
            if (str[i] == ']' && top != '[') return false;
            if (str[i] == '}' && top != '{') return false;
        }
    }
    return StackEmpty(S);   // 栈空才算全部匹配
}
\`\`\`

**正确性要点**：①右括号出现时栈空 → 不匹配；②右括号与栈顶不配对 → 不匹配；③结束时栈非空（左括号多余）→ 不匹配。只有这三种情况都不出现才匹配成功。时间复杂度 O(n)、空间 O(n)。

**重点：**括号匹配是"栈 = 嵌套结构的天然工具"的典型体现。栈的另一个核心应用是处理**嵌套**问题（如函数调用、HTML 标签配对）。

### 表达式求值：中缀转后缀与后缀求值
<!-- kp: ch3-s2-k2 emphasis: key -->

## 中缀转后缀（逆波兰）

规则：从左到右扫描中缀表达式，**操作数直接输出**；**运算符**与栈顶比较优先级——优先级高于栈顶则入栈，否则（低于或等于）弹出栈顶运算符输出，直到栈顶优先级更低或栈空，再将该运算符入栈；**左括号**直接入栈；**右括号**则依次弹出栈中运算符输出，直到遇到左括号（左括号出栈但不输出）。扫描结束后弹出栈中所有运算符。

例如中缀 $A+B\\times C-D$ 转换为后缀为 $ABC\\times+D-$。

## 后缀表达式求值

从左到右扫描后缀表达式：遇**操作数入栈**，遇**运算符**则弹出栈顶两个操作数（先弹 b、再弹 a，计算 a 运算符 b），结果重新入栈。扫描结束后栈顶即表达式的值。

\`\`\`c
double evalPostfix(char exp[], int n) {
    SqStack S; InitStack(S);
    for (int i = 0; i < n; i++) {
        if (isdigit(exp[i]))
            Push(S, exp[i] - '0');          // 操作数入栈
        else {                              // 运算符
            double b; Pop(S, b);
            double a; Pop(S, a);            // 注意弹出顺序 a 先 b 后
            double r;
            switch (exp[i]) {
                case '+': r = a + b; break;
                case '-': r = a - b; break;
                case '*': r = a * b; break;
                case '/': r = a / b; break;
            }
            Push(S, r);
        }
    }
    double v; Pop(S, v);
    return v;
}
\`\`\`

## 栈与递归

递归调用时，系统用**递归工作栈**保存每一层调用的返回地址、局部变量和实参。递归的优点是代码简洁、易读；缺点是效率较低（大量重复计算与函数调用开销），且递归深度过大可能**栈溢出**。每个递归算法都可以用栈改写为非递归算法。

**重点：**中缀转后缀、后缀求值是 408 高频大题考点，务必亲手模拟一遍完整过程；"先弹 b 再弹 a"的顺序对减法和除法至关重要。

### 表达式求值：中缀直接求值（算符优先法）
<!-- kp: ch3-s2-k3 -->

## 算符优先法

直接对中缀表达式求值需要两个栈：**操作数栈（OPND）**与**运算符栈（OPTR）**。算法步骤：

1. 初始化 OPND 空栈，OPTR 栈底压入表达式结束符 \`#\`；
2. 从左到右扫描：操作数入 OPND；
3. 运算符与 OPTR 栈顶运算符比较优先级：
   - 若优先级高，入 OPTR；
   - 若优先级低或相等，则弹出 OPTR 栈顶运算符，并从 OPND 弹出两个操作数运算，结果压入 OPND；
4. 遇到 \`#\` 且 OPTR 栈顶也为 \`#\` 时结束，OPND 栈顶即结果。

优先关系表的核心规则：乘除优先级高于加减；同优先级运算符（加减、乘除）为**左结合**，即先算左边——因此"当前运算符优先级**不高于**栈顶时弹出栈顶"。左括号与栈内任何运算符比较均为"高于"（入栈）；右括号与栈内运算符比较均为"低于"（持续弹出直到左括号）。

## 典型例题

表达式 $$3+4\\times 5$$ 的求值过程：3 入 OPND，+ 入 OPTR，4 入 OPND，× 优先级高于栈顶 + 故入 OPTR，5 入 OPND；遇到 \`#\`，弹出 × 计算 $$4\\times5=20$$ 压回，再弹出 + 计算 $$3+20=23$$，得到结果 23。

**重点：**算符优先法是编译原理中表达式求值的原型算法。408 考查通常以选择题形式给出求值过程，要求选择某一时刻的栈内状态，需熟记"优先级不高于栈顶则弹栈运算"的规则。

## 队列
<!-- sec: ch3-s3 -->

### 队列的定义与顺序实现
<!-- kp: ch3-s3-k1 emphasis: key -->

## 队列的定义

**队列（Queue）**是只允许在**一端（队尾 rear）**插入、在**另一端（队头 front）**删除的线性表，又称**先进先出（FIFO, First In First Out）**的线性表。插入操作称为**入队（EnQueue）**，删除操作称为**出队（DeQueue）**。队列中 front 指向队头元素，rear 指向队尾元素。

## 顺序队列的问题

若用数组实现普通顺序队列，随着不断入队出队，front 和 rear 都只增不减，当 rear 到达数组末尾时即使 front 前面仍有大量空位，也**无法再入队**，造成"**假溢出**"。解决假溢出的办法有两种：一是移动元素（代价 O(n)，不采用）；二是采用**循环队列**。

## 循环队列

**循环队列**将数组在逻辑上首尾相接，入队时 \`rear = (rear+1) % MaxSize\`，出队时 \`front = (front+1) % MaxSize\`。取模运算实现了指针的循环回绕。

**重点：**循环队列中 front 与 rear 相等时队列可能为空也可能为满，必须通过"牺牲一个存储单元""设标志位"或"设计数器"区分。牺牲一个单元（最常用）：判满 \`(rear+1)%MaxSize == front\`，判空 \`front == rear\`，此时队列实际最多存 MaxSize-1 个元素。

### 循环队列的实现与队空队满判定
<!-- kp: ch3-s3-k2 emphasis: key -->

## 循环队列的实现

\`\`\`c
typedef struct {
    ElemType data[MaxSize];
    int front, rear;   // front 指向队头元素，rear 指向队尾元素的下一位置
} SqQueue;

bool InitQueue(SqQueue &Q) { Q.front = Q.rear = 0; return true; }
bool QueueEmpty(SqQueue Q) { return Q.front == Q.rear; }
bool EnQueue(SqQueue &Q, ElemType x) {
    if ((Q.rear + 1) % MaxSize == Q.front) return false; // 队满
    Q.data[Q.rear] = x;
    Q.rear = (Q.rear + 1) % MaxSize;
    return true;
}
bool DeQueue(SqQueue &Q, ElemType &x) {
    if (Q.front == Q.rear) return false;  // 队空
    x = Q.data[Q.front];
    Q.front = (Q.front + 1) % MaxSize;
    return true;
}
\`\`\`

以上实现中 front 指向**队头元素**，rear 指向**队尾元素的下一个位置**，通过牺牲一个存储单元区分队空与队满。此时：

- 队空条件：\`Q.front == Q.rear\`
- 队满条件：\`(Q.rear + 1) % MaxSize == Q.front\`
- 元素个数：\`(Q.rear - Q.front + MaxSize) % MaxSize\`

**注意**：若采用**设标志位**方案（另设 tag，入队置 1、出队置 0），则队空条件为 \`front == rear && tag == 0\`，队满条件为 \`front == rear && tag == 1\`，此时队列可存满 MaxSize 个元素。

**重点：**元素个数公式 $$(Q.rear-Q.front+MaxSize)\\%MaxSize$$ 是必考公式，务必牢记；选择题常要求根据给定 front/rear 判断队中元素个数或是否满。

### 链式队列
<!-- kp: ch3-s3-k3 -->

## 链队的定义

**链式队列**用单链表实现队列，队头指针 front 指向**头结点**，队尾指针 rear 指向**尾结点**。入队在队尾（rear->next 处）进行，出队在队头（front 之后）进行。

\`\`\`c
typedef struct LinkNode {
    ElemType data;
    struct LinkNode *next;
} LinkNode;
typedef struct {
    LinkNode *front, *rear;   // 队头与队尾指针
} LinkQueue;

bool EnQueue(LinkQueue &Q, ElemType x) {
    LinkNode *s = (LinkNode*)malloc(sizeof(LinkNode));
    if (s == NULL) return false;
    s->data = x; s->next = NULL;
    Q.rear->next = s;      // 新结点链到队尾
    Q.rear = s;            // 更新队尾指针
    return true;
}
bool DeQueue(LinkQueue &Q, ElemType &x) {
    if (Q.front == Q.rear) return false;  // 队空
    LinkNode *p = Q.front->next;
    x = p->data;
    Q.front->next = p->next;
    if (Q.rear == p) Q.rear = Q.front;    // 队中只有一个结点，删除后置空
    free(p);
    return true;
}
\`\`\`

**注意**：出队时若删除的是队列中唯一的元素结点，必须同时把 \`rear\` 改回指向头结点（\`Q.rear = Q.front\`），否则 rear 成为野指针。链队判空条件为 \`Q.front == Q.rear\`（都指向头结点）。

## 队列的应用

队列广泛应用于：**层次遍历**二叉树/图（BFS）、操作系统中的**先来先服务（FCFS）**调度与打印机**缓冲池**、解决主机与外设速度不匹配的问题、计算服务窗口的平均等待时间等。

**重点：**链队不存在"满"的问题，适合长度未知的队列；出队删唯一元素时维护 rear 是易错点。

## 双端队列与栈队列综合
<!-- sec: ch3-s4 -->

### 双端队列
<!-- kp: ch3-s4-k1 emphasis: key -->

## 双端队列的定义

**双端队列（Deque）**是允许在**两端**都进行插入和删除操作的线性表。根据受限情况可分为：

- **双端队列**：front 端和 rear 端均可插入、删除；
- **输出受限的双端队列**：两端均可插入，但只有一端可删除；
- **输入受限的双端队列**：两端均可删除，但只有一端可插入。

栈是"一端插入、同端删除"的特例；普通队列是"一端插入、另一端删除"的特例。双端队列的灵活性介于两者之间。

## 双端队列的输出序列

以输入受限/输出受限双端队列为例，判定某一输出序列是否可能，需结合受限端的特点逐一模拟。解题技巧：对于输出受限队列，输入时可选择在受限端或自由端入队；对于输入受限队列，输出时可选择受限端或自由端出队。一般通过**穷举 + 排除**或**逆推模拟**确定。

**典型结论**：若输入序列为 1,2,3,4，则双端队列（两端均不受限）可以输出 4,1,3,2 等序列，而输出受限或输入受限的队列可输出的序列集合是双端队列输出序列集合的子集。

**重点：**408 常以"给定入队序列，判断哪个序列不可能由某种受限双端队列输出"命题。解题核心是明确受限端的位置及其对操作的影响，可用栈模拟辅助判断。

### 栈与队列的经典综合题
<!-- kp: ch3-s4-k2 -->

## 用队列模拟栈 / 用栈模拟队列

**用两个栈实现队列**（经典题目）：设入队栈 S1 与出队栈 S2。入队直接压入 S1；出队时若 S2 为空，则把 S1 中元素全部弹入 S2（此时 S1 栈底元素变成 S2 栈顶，即队头），再从 S2 弹出。每个元素"进 S1、出 S1、进 S2、出 S2"恰好 4 次 O(1) 操作，均摊复杂度 O(1)。

**用两个队列实现栈**：设队列 Q1 为主队列、Q2 为辅助队列。入栈直接入 Q1；出栈时把 Q1 中除最后一个元素外全部移入 Q2，弹出 Q1 中剩余元素作为栈顶，然后交换 Q1、Q2 的角色。出栈操作代价为 O(n)。

## 输出序列的分析

给定入栈序列 1,2,3，可能的出栈序列有 5 种（Catalan 数 $$C_3 = \\frac{1}{3+1}\\binom{6}{3}=5$$）：123、132、213、231、321。**Catalan 数公式**：n 个元素以某种顺序入栈（可穿插出栈），可能的出栈序列总数为：

$$C_n = \\frac{1}{n+1}\\binom{2n}{n}$$

**重点：**Catalan 数给出"入栈序列固定时的出栈序列总数"，而"判断某个具体序列是否合法"应使用栈模拟：依次入栈，遇合法出栈就出栈，最终栈空则合法。
`;export{e as default};