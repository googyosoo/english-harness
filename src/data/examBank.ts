// 2020~2026년 고1, 고2, 고3 전국연합학력평가/수능 기출 문항 데이터 타입 및 초기 샘플

export interface ExamBankItem {
  id: string;
  year: string;
  exam: string;
  grade: '고1' | '고2' | '고3';
  qNumber: number;
  category: 'listening' | 'reading' | 'integrated';
  type: string;
  title: string;
  script?: string;
  passage?: string;
  words?: { word: string; meaning: string }[];
  cefrLevel: string;
  lexile: string;
  suggestedActivities: string[];
}

export const INITIAL_EXAM_BANK_SAMPLES: ExamBankItem[] = [
  {
    "id": "2026-9월-고1-L01",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 1,
    "category": "listening",
    "type": "듣기 1번 실전",
    "title": "[2026년 9월 고1] 듣기 1번 원어민 담화",
    "script": "M: Good morning, students. This is your principal. I’d like to share an important announcement with you today. Recently, we have noticed that many students use AI too much for their assignments. While AI can be helpful, assignments should still reflect each student’s own thinking and effort. Students should use AI responsibly and not copy answers directly from it. For this reason, starting next month, we’ll introduce an AI­detection system to limit the overuse of AI. This system will ensure that you don’t rely on AI alone but instead use it responsibly as a learning tool. Thank you for listening.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L02",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 2,
    "category": "listening",
    "type": "듣기 2번 실전",
    "title": "[2026년 9월 고1] 듣기 2번 원어민 담화",
    "script": "W: H ey, Jake. D id you apologize to your sister today? M: Yeah, Mom. I told her I was sorry. W: And did she accept it? M: No, she just walked away. W: What exactly did you say? M: I said, “I’m sorry, but I only yelled because you kept bothering me.” W: Jake, that’s not a real apology. M: Why not? I said I was sorry. W: When you apologize, you shouldn’t make excuses. If you want her to accept your apology, say sorry without defending yourself, and actually mean it. M: Then, do you think I should apologize one more time? W: Yes. Sincerely say you’re sorry, without any excuses. M: Okay. I’ll try again.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L03",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 3,
    "category": "listening",
    "type": "듣기 3번 실전",
    "title": "[2026년 9월 고1] 듣기 3번 원어민 담화",
    "script": "M: Hello, teachers! Welcome back to Great Teachers Tips! When you teach a new concept, do your students look confused? Here’s a simple tip: use something familiar as an example. When you connect an idea to something students already know, you can help students understand the idea more easily. For example, when you introduce paragraph structure as a new concept, compare it to a hamburger: the top bun is the topic sentence, the meat and vegetables are the details, and the bottom bun is the closing sentence. Try this tip for effective teaching.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L04",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 4,
    "category": "listening",
    "type": "듣기 4번 실전",
    "title": "[2026년 9월 고1] 듣기 4번 원어민 담화",
    "script": "W: Hi, Jun! Come on in. [Pause] I finished making my hobby room. M: Nice! I’ve been curious about how you set it up. W: I put a yoga mat on the floor. How do you like the striped pattern? M: I love it. Placing the piano under the window is a great idea. W: I can’t wait to play it in the warm natural light. Do you see that canvas next to the armchair? I painted it! M: Amazing. You’ve always liked painting. W: Right. And look, I added a round light on the wall for reading in the armchair. M: Good idea. The two speakers on the bookshelf are perfect for soft music. W: Exactly. Playing quiet music is great while doing yoga. M: Absolutely. This room is ideal for enjoying your hobbies.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L05",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 5,
    "category": "listening",
    "type": "듣기 5번 실전",
    "title": "[2026년 9월 고1] 듣기 5번 원어민 담화",
    "script": "M: Mia, we are almost ready for next week’s Digital­Free Learning Day. I’m so excited that students will do some activities without digital devices. W: Right. Let’s check what we’ve prepared so far. [Pause] I bought some snacks for the students. M: Okay. I put up the event schedule posters in each hallway. W: How about the indoor activities in the quiet reading area? M: Those are ready. I set up chairs and books. W: Good. I’ve gathered student volunteers to help run the activities. And how is the outdoor mini Olympics going? M: It’s all set! But if it rains, students won’t be able to participate in it. W: Then I’ll prepare board games as a backup by tomorrow. M: Perfect.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L06",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 6,
    "category": "listening",
    "type": "듣기 6번 실전",
    "title": "[2026년 9월 고1] 듣기 6번 원어민 담화",
    "script": "W: Good afternoon! Welcome to Danny Brothers’ Cookie Shop. How can I help you today? M: Hi, I’m looking for a cookie gift set. Could you tell me about your options? W: Sure. We have Set A with mini cookies for $20, and Set B with jumbo cookies for $35. M: Hmm, I think I’ll take Set B. W: Great. Would you like gift wrapping? M: Is it free? W: No, the price of the wrapping is $3. But it comes with a special box and a ribbon. M: Alright, I’ll add it. W: So, that’s one Set B with gift wrapping, right? M: Yes. Oh, I have a Sweet Day coupon. W: Perfect! That gives you $5 off the price when your total is over $30. M: Awesome! Here’s my credit card.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L07",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 7,
    "category": "listening",
    "type": "듣기 7번 실전",
    "title": "[2026년 9월 고1] 듣기 7번 원어민 담화",
    "script": "M: Hey, Emma. It’s Mark. Are you going to the Robotics Experience Expo this Saturday? W: I really want to, but I can’t make it this time. M: Really? Is it because you have to finish your science project? W: No, I submitted it yesterday. M: Then do you have your math club meeting? I remember you usually meet on Saturdays. W: Not this week. The meeting was moved to next Tuesday. M: Hmm.... Then do you need to look after your younger brother for your parents? W: No. My parents will be home this weekend. M: So why can’t you go? You were so excited about building robots. W: Actually, I promised my cousin I’d go to his piano concert. He’s been practicing for months, so I really want to be there. M: Oh, that’s sweet. I think you should go then. I hope he does well! W: Thanks. I’ll join the expo next time.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L08",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 8,
    "category": "listening",
    "type": "듣기 8번 실전",
    "title": "[2026년 9월 고1] 듣기 8번 원어민 담화",
    "script": "W: Hey, Ryan. What are you reading on our department notice board? M: It’s about the Island Medical Volunteer Program during this coming winter break. W: Sounds special. What kind of program is it? M: It’s a volunteer program where doctors and medical students like us visit a small island to provide free check­ups for the residents. W: Wow, that seems very meaningful. How long does it last? M: For a week, from January 4th to 10th. W: Where exactly is it held? M: On Silver­Star Island, two hours by boat from the mainland. Why don’t we join? W: Let’s do it. How can we apply for the program? M: We first have to apply online. W: I see. How much does it cost to participate? M: Nothing, it’s free. Also, meals and housing are provided. W: Sounds like a good opportunity.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L09",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 9,
    "category": "listening",
    "type": "듣기 9번 실전",
    "title": "[2026년 9월 고1] 듣기 9번 원어민 담화",
    "script": "W: Are you looking for an exciting show? Come and experience the SkySymphony at Aurora Sky Resort. It takes place in the lobby of the main building. The show uses LED screens and speakers, turning the lobby into a true theater of lights and sounds. The highlight of the show is that 1,000 lights hanging from the high ceiling move up and down with music. Each show starts every hour from 10 a.m. to midnight. It lasts about five minutes. The theme of the show changes by season, so you can discover something new each time you visit. Bring your family and friends and enjoy your day with a truly memorable moment!",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L10",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 10,
    "category": "listening",
    "type": "듣기 10번 실전",
    "title": "[2026년 9월 고1] 듣기 10번 원어민 담화",
    "script": "M: Hey, Olivia. Could you help me with shopping? W: Sure, Adam. What are you looking for? M: I’m choosing a smart photo frame. I want to display a lot of photos on my desk. Can you help me choose one? W: Sure. What do you need to consider first? M: Well, I don’t want to spend more than $100. W: Got it. What about storage capacity? M: I need at least 32GB of storage capacity. I have many family photos to upload. W: Okay. Do you have any preference for the screen size? M: A 16­inch screen seems too big for my desk. W: In that case, only two options are left. How about buying the one with the sleep mode? It saves power when not in use. M: Sounds good! I’ll take the one with the sleep mode. I’ll order it right now.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L11",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 11,
    "category": "listening",
    "type": "듣기 11번 실전",
    "title": "[2026년 9월 고1] 듣기 11번 원어민 담화",
    "script": "W: Mathew, these days I’m late quite often because I keep turning off my alarm and falling back to sleep. M: Yeah, I’ve noticed you’ve been late for class. W: I need to fix this. What do you think would actually help me? M:",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L12",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 12,
    "category": "listening",
    "type": "듣기 12번 실전",
    "title": "[2026년 9월 고1] 듣기 12번 원어민 담화",
    "script": "M: Mom, I can’t see the board clearly at school these days. 11 16 W: Really? I guess your eyesight has gotten worse. M: Maybe. I think I need to have an eye checkup. W:",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L13",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 13,
    "category": "listening",
    "type": "듣기 13번 실전",
    "title": "[2026년 9월 고1] 듣기 13번 원어민 담화",
    "script": "W: Eric, why are you reading the labels so carefully? M: I’m checking the food mileage. W: Food mileage? I’ve never heard of that. M: It’s a number that shows how far food travels before it reaches us. W: Oh, okay. Why is it important? M: If food comes from far away, it uses more fuel. W: Then, that means more pollution, which is bad for the environment. M: Exactly. That’s why I check the food mileage on the labels. W: I see. I’d love to join you in helping the environment. M: Great! Follow my example. I usually buy food produced nearby. W: Could you be more specific about it? M:",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L14",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 14,
    "category": "listening",
    "type": "듣기 14번 실전",
    "title": "[2026년 9월 고1] 듣기 14번 원어민 담화",
    "script": "M: Jessie, you look worried. What’s wrong? W: Well, I think I should get a new phone. M: A new phone? Didn’t you just get one recently? W: Yeah.... But I dropped it last week, and the screen is broken badly. M: Oh no. Is it still usable? W: Not really. It freezes a lot, and fixing it would cost too much. M: Then, it would be better to get a new one. W: But I feel bad because my parents just spent so much money on my phone. M: Hmm.... Why don’t you think about a used phone? W: I haven’t thought about that. I heard there’s a website where people buy and sell used phones. M: That could be worth trying before buying a brand­new one. You might even find something you like there. W:",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-9월-고1-L15",
    "year": "2026",
    "exam": "9월",
    "grade": "고1",
    "qNumber": 15,
    "category": "listening",
    "type": "듣기 15번 실전",
    "title": "[2026년 9월 고1] 듣기 15번 원어민 담화",
    "script": "M: Henry and Jenny are classmates who love reading, and soon a famous writer will give a book talk at their school for his most recent novel. Henry has been looking forward to the event. He really wants to ask the author a question about the main character’s final decision. However, because he has a family trip on the same day, he cannot attend the book talk. He heard Jenny is going to the book talk. So, Henry wants to tell Jenny to ask his question since he won’t be there. In this situation, what would Henry most likely say to Jenny? W: Hello, Fresh Living subscribers. Every year, tons of food are thrown away just because we didn’t store it the right way. Today, I’d like to talk about how we can lower food waste by storing food in the proper way. First, don’t put onions in the refrigerator because they soften easily. Store them in a cool, dry place with good airflow. Next, keep cabbage in the refrigerator’s vegetable drawer. It lasts longer when you don’t remove the outer leaves which protect the inner part from drying out. And what about bread? If you want to keep it fresher for longer, store it in the freezer. Finally, mushrooms go bad fast since they take in water easily. Keeping them in a paper bag makes them stay dry and fresh for a longer time. With these simple tips, we can keep our food fresh and less food goes into the trash. Have a good day.",
    "words": [],
    "cefrLevel": "A2+",
    "lexile": "850L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  }
];
