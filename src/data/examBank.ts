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
    "id": "2026-수능-고3-L01",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 1,
    "category": "listening",
    "type": "듣기 목적 파악",
    "title": "[2026년 수능 고3] 1번 듣기 목적 파악",
    "script": "M: Hello, viewers. It's Ryan. Welcome back to Only4Health Channel. Do you want to have good sleep? Then, the app Nightly Jou rney is perfect for you. This app provides a variety of aids that help you sleep well, such as calming sounds, peaceful and quiet music, and bedtime stories. It also offers audio exercises that teach you how to breathe in order to sleep bette r. Next time when you go to bed, consider Nightly Journey. Then, you'll wake up feeling refreshed the next mo rning. Why don't you t ry this app and get some good sleep tonight? Thank you for watching. Çt\u0000 »8È\u001cÉÀÅÐ\u0000 ­\u0000Õ\\\u0000 È\u0000Ç­Ç@\u0000 Õ\\­m­PÇ!¬üÈ\u0015ÓÉ¬\u0000ÆÐÅÐ\u0000 ÇÂµ²È²ä\u0000. - 2 -",
    "passage": null,
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-수능-고3-L02",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 2,
    "category": "listening",
    "type": "듣기 의견 파악",
    "title": "[2026년 수능 고3] 2번 듣기 의견 파악",
    "script": "W: How's it going, Liam? M: Good, Emily. Are you about to go indoor rock climbing like yo u do eve ry weekend? W: I am. Do you want to try it, too? M: Maybe, but I wonder why you enjoy it so much. W: I think indoor rock climbing helps improve problem-solving skills. M: Really? How so? W: You use strategic thinking to solve the problem of getting to the top. That means you have to strategically plan the holds to grab. M: Hmm, I can see that. What if the plan doesn't work though? W: You have to adapt your plan while climbing. It makes you better at adjusting to new information. That's the basics of solving problems. M: That makes sense. W: Yeah. I'm sure your problem-solving skills will improve if you go indoor rock climbing. M: Okay. I'll try it. Çt\u0000 »8È\u001cÉÀÅÐ\u0000 ­\u0000Õ\\\u0000 È\u0000Ç­Ç@\u0000 Õ\\­m­PÇ!¬üÈ\u0015ÓÉ¬\u0000ÆÐÅÐ\u0000 ÇÂµ²È²ä\u0000. - 3 -",
    "passage": null,
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-수능-고3-L03",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 3,
    "category": "listening",
    "type": "듣기 관계 파악",
    "title": "[2026년 수능 고3] 3번 듣기 관계 파악",
    "script": "M: Good afternoon, students. I'm Mr. Flynn, y our school counselor. If you become anxious when facing an important job interview or presen tation, I have a useful tip for you. Making a big pose can relieve your a nxiety. For example, you can stretch out your a rms in a V-shape and hold that pose. Also, you could make a big pose as your favorite superhero does i n t h e movies. When you make a big pose, you'll occupy more space. The n, your body will send a message to your brain saying that you're power ful, which will ease your anxiety. Next time you want to feel less anxious , try to make a big pose. Çt\u0000 »8È\u001cÉÀÅÐ\u0000 ­\u0000Õ\\\u0000 È\u0000Ç­Ç@\u0000 Õ\\­m­PÇ!¬üÈ\u0015ÓÉ¬\u0000ÆÐÅÐ\u0000 ÇÂµ²È²ä\u0000. - 4 -",
    "passage": null,
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-수능-고3-L04",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 4,
    "category": "listening",
    "type": "듣기 그림 세부 파악",
    "title": "[2026년 수능 고3] 4번 듣기 그림 세부 파악",
    "script": "W: Mr. Howard, how was your family trip to Compton Railway Museum over the weekend? M: It was great, Ms. Joyce. Here's a photo. W: Let me see. Wow, there's a train on the rails. M: Yeah. Do you see the boy wearing a heart-patterned T-shirt next to the train? W: He looks so lovely. Is he your son? M: He is. We took a walk through the museum. It was really good. W: I can see. Oh, there's a bench in front of the shop window. It looks nice. Did you get anything from the shop? M: Yes. Look at the flower-shaped doormat on the ground. I bought one like that. W: It's so cute. The three chairs around the table look convenient. Did you take a break there? M: W e did. W: The museum seems worth visiting. I'll have to go there. Çt\u0000 »8È\u001cÉÀÅÐ\u0000 ­\u0000Õ\\\u0000 È\u0000Ç­Ç@\u0000 Õ\\­m­PÇ!¬üÈ\u0015ÓÉ¬\u0000ÆÐÅÐ\u0000 ÇÂµ²È²ä\u0000. - 5 -",
    "passage": null,
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-수능-고3-L05",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 5,
    "category": "listening",
    "type": "듣기 할 일 파악",
    "title": "[2026년 수능 고3] 5번 듣기 할 일 파악",
    "script": "M: Honey, I'm excited that we're opening our homemade-pie store tomorrow. W: Me, too. Do you think everything's ready? M: I do. But let's go over what we've done. W: Good idea. I completed the product list for sale. Did you take photos of the pies? M: I took photos of the walnut, pumpkin, blueberry, and apple pies. W: Perfect. What about uploading information onto social media? M: Don't worry. I advertised our pies on social media. W: I hope it brings in a lot of customers. I also prepared forks and plates for customers on our opening day. M: One more thing, don't forget to confirm the delive ry of the ingredients for making more pies. W: Right. I'll do that this afternoon. M: Wonderful. See, we're ready for tomorrow. Çt\u0000 »8È\u001cÉÀÅÐ\u0000 ­\u0000Õ\\\u0000 È\u0000Ç­Ç@\u0000 Õ\\­m­PÇ!¬üÈ\u0015ÓÉ¬\u0000ÆÐÅÐ\u0000 ÇÂµ²È²ä\u0000. - 6 -",
    "passage": null,
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-수능-고3-L06",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 6,
    "category": "listening",
    "type": "듣기 금액 계산",
    "title": "[2026년 수능 고3] 6번 듣기 금액 계산",
    "script": "W: Welcome to Winter Land Mart. How may I help you? M: Hi. I'm shopping for an electric heater. W: How about this type? It's very popular. M: Let me see. Oh, I like it. W: W ell, we have it in three sizes. The small one is $50, the medium is $70, and the large is $100. M: I'll take one medium-sized heater. Do you also have slippers? W: Yes. We have wool and leather ones. A pair of wool slippers i s $5, and a pair of leather ones is $10. M: Hmm, I'll take two pairs of leather ones. W: Great. So, one medium-sized el ectric heater and two pairs of leather slippers. Is that correct? M: Yes, that's right. Can I use this 10% off coupon? W: I'll check. [Pause] O h , I ' m s orry. You cannot use this coupon because it isn't valid anymore. M: That's okay. Here's my credit card. Çt\u0000 »8È\u001cÉÀÅÐ\u0000 ­\u0000Õ\\\u0000 È\u0000Ç­Ç@\u0000 Õ\\­m­PÇ!¬üÈ\u0015ÓÉ¬\u0000ÆÐÅÐ\u0000 ÇÂµ²È²ä\u0000. - 7 -",
    "passage": null,
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-수능-고3-L07",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 7,
    "category": "listening",
    "type": "듣기 이유 파악",
    "title": "[2026년 수능 고3] 7번 듣기 이유 파악",
    "script": "M: Good morning, Ms. Lee. Are you heading to Morning Tea Club? W: Not today, Mr. Thomson. I can't attend it this time. M: Really? But you enjoy starting the workday by drinking tea with co-workers. Did you forget to bring your tea? W: No, I always keep it in my bag. M: Are you just too tired this morning because you worked late last night? W: Not at all. I feel fine, just like usual. M: Then, has your doctor told you not to drink too much tea? W: No, my doctor actually encourages me to drink tea. He says it's good for my health. M: Oh, I see. Something else must have come up then. W: Yes. I have an early business meeting that overlaps with the tea club. M: That's too bad. I hope your meeting goes well. Çt\u0000 »8È\u001cÉÀÅÐ\u0000 ­\u0000Õ\\\u0000 È\u0000Ç­Ç@\u0000 Õ\\­m­PÇ!¬üÈ\u0015ÓÉ¬\u0000ÆÐÅÐ\u0000 ÇÂµ²È²ä\u0000. - 8 -",
    "passage": null,
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-수능-고3-L08",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 8,
    "category": "listening",
    "type": "듣기 언급되지 않은 것",
    "title": "[2026년 수능 고3] 8번 듣기 언급되지 않은 것",
    "script": "W: Hey, Nathan. Have you heard of the Autumn Treasure Hunt event that is coming soon? M: Autumn Treasure Hunt? That's interesting. Where will it take place? W: It'll be held in Pinenut Park. Participants can search for hi dden treasure there. M: Sounds fun. You know I'm a great treasure hunter. When is it? W: It's this Saturday, November 22nd. M: Perfect. I'm free that day. There must be a big prize for the winner. Do you know what it is? W: Yeah. If you collect the most treasure, you'll get a gift card worth $100 as a reward. M: Wow, that's a big prize. How can I sign up for the Autumn Tre asure Hunt event? W: You can visit its website and register online. M: Awesome! Let's go there together. W: That'd be great.",
    "passage": null,
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "listening",
      "speaking"
    ]
  },
  {
    "id": "2026-수능-고3-R20",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 20,
    "category": "reading",
    "type": "필자의 주장 파악",
    "title": "[2026년 수능 고3] 20번 필자의 주장 파악",
    "script": null,
    "passage": "The study of literature has repeatedly failed to recognize the influence of modern musical lyricists and their contributions to the evolution of language. U nlike Shakespeare, who has been studied and celebrated for his development of the English language, particularly in vocabulary and grammatical structure, modern songwriters have ex perienced restraints on the acknowledgement of their cont ributions and largely been ignored. Over the past century, we have witnessed an explosion of incredible literary works by these artists, who, through their music, have used linguistic man ipulation and storytelling to enrich our language and literature . Producing lyrics of distinct and complex imagery, songwriters have had an incredible literary impact on our language . Their remarkable works, including influences on modern language development, must be recognized in the field of modern literature. * lyricist: 작사가 ** restraint: 제약",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R21",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 21,
    "category": "reading",
    "type": "밑줄 친 부분의 함축 의미 추론",
    "title": "[2026년 수능 고3] 21번 밑줄 친 부분의 함축 의미 추론",
    "script": null,
    "passage": "바로 가장 적절한 것은? Digital platforms have made a lot of work less sticky. As work becomes ever more modularised, commoditised and standardised, and as markets for digital wo rk are created, ties between service work and particular places can be disconnected. While the business process of outsourcing that emerged in the 1990s allowed large companies to take advantage of a 'global reserve army' by moving their call centres to cheap and distant labour markets, cloudwork changes the volume and granularity at which geographically non-proximate work can take place. A small business in New Y ork can hire a freelance transcriber in Nairobi one day and New Delhi the next. No offices or factories need to be built, no local regulations are observed, and ― in most cases ― no local taxes are paid. The switch in the production network of work happens by simply sending some emails or clicking some buttons on a digital work platform. And, in this way, the employer leaves behind no material traces in the places where it was once an employer. * commoditise: 상품화하다 ** granularity: 과립상(顆粒狀)",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R22",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 22,
    "category": "reading",
    "type": "글의 요지 파악",
    "title": "[2026년 수능 고3] 22번 글의 요지 파악",
    "script": null,
    "passage": "A sport ecosystem exists based on the type and rate of coopetition existing. Coopetition is defined as \"the simultaneous pursuit of cooperation and competition among firms to leverage strategically importa nt resources for superior value creation purposes\". It is a useful way to understand the dynamic nature of sport businesses which need to collaborate for resource efficiency purposes but potentially compete with each other. This special rela tionship should be managed properly due to trust and conf idence issues being paramount. It can be challenging to be co llaborative and competitive in sport as they involve different forms of behaviour. This means a careful balancing act may be required in terms of the amount of emphasis placed on each activity. Often sport managers will try to be more competitive due to performance reasons and less collaborative. By necessity they may need to share information but do so in a cautious manner. This means it might be better to have plans in place about how to pursue both simultaneously. This will ensure one is not neglected at the expense of the other. * simultaneous: 동시의 ** paramount: 최고의",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R23",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 23,
    "category": "reading",
    "type": "글의 주제 파악",
    "title": "[2026년 수능 고3] 23번 글의 주제 파악",
    "script": null,
    "passage": "Emphasizing speed over frequency can make sense in contexts where everyone is expected to plan around the timetable, including peak-only commute services and very long trips with low demand. In all other contexts, though, it seems to be a common motorist's error. Roads are there all the time, so their speed is the most important fact that distinguishes them. But transit is only there if it's coming soon. If you hav e a car, you can use a road whe never you want and experience its speed. But transit has to e xist when you need it (span), an d it needs to be coming soon (fre quency). Otherwise, waiting time will wipe out any time savings from a faster service. Unless you're comfortable planning your life around a particular scheduled trip, speed is worthless without frequency, so a transit map that screams about speed a nd whispers about frequency may simply be planting confusion. * commute: 통근",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R24",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 24,
    "category": "reading",
    "type": "글의 제목 파악",
    "title": "[2026년 수능 고3] 24번 글의 제목 파악",
    "script": null,
    "passage": "The economic benefit of culturtainment makes it attractive to politicians and policy makers alike. A potential increase in inbound visitor numbers coupled with their demand for related goods and services (travel, accommodation, retail) is an incentive for those within governments and authorities to work with cultural groups in order to develop celebrations and commemorations into larger and more high-profile events. However, such commercialization risks culturtainment becoming homogeneous and losing its origi nal 'message' that could lead to a dilution of audiences. This could also lead to smaller non-commercial indepe ndent events being set up that would only serve to divide audiences further. This is something that planners and stakeholders will need to balance against potential financial gain. Changing political, social and religious landscapes will lead to the emergence of new cultures, and with them new culturtainment experiences. Overall this is a healthy growth sector of the entertainment industry, but one that by its very nature is delicate in the face of exploitation. * homogeneous: 동종의 ** dilution: 희석 *** exploitation: 착취",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R29",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 29,
    "category": "reading",
    "type": "문맥상 어법 적절성",
    "title": "[2026년 수능 고3] 29번 문맥상 어법 적절성",
    "script": null,
    "passage": "W e a r e e x c e p t i o n a l l y s m a r t , a nd this helps us adapt to a w i d e r a n g e o f e n v i r o n m e n t s . B u t w e a r e n o t n e a r l y s m a r t enough as individuals",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R31",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 31,
    "category": "reading",
    "type": "빈칸 추론 (어휘)",
    "title": "[2026년 수능 고3] 31번 빈칸 추론 (어휘)",
    "script": null,
    "passage": "surplus-producing and food deficit regions, and these firms made it their business to know t he state of supply and demand in both. Because this information was the key to their , these firms worked in relative secrecy, frequently built on family ties, trust, and loyalty. In additio n, these firms were able to benefit from the rise of commodity exchanges and commodities futures markets that emerged in the mid-1800s. Agricultural ma rkets are naturally unstable, due to changes in harvest size that result from variable weather patterns and other factors. Locking-in prices by buying and selling grain for future delivery helped these firms to minimize such risks. It made sense for the grain trading companies to manage their risks within a single firm that was operating in more than one country, rather than operating as independent national companies trading with each other. Their access to information in multiple markets enabled them to easily cover the risks associated with agricultural commodity trade. * deficit: 부족",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R32",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 32,
    "category": "reading",
    "type": "빈칸 추론 (구문)",
    "title": "[2026년 수능 고3] 32번 빈칸 추론 (구문)",
    "script": null,
    "passage": "you use them every day in conversation. In conversation and in writing, we all rely heavily on cooperation to make sense of e x c h a n g e s , a n d a p o l i s h e d p r a c t i c a l s t y l e m a k e s c o o p e r a t i o n easier. Writers develop such a style by acknowledging that readers expect the same things that listeners expect in conversation: clarity, relevance, and proportion. If you listen to someone who is not clear, who cannot stay on the topic, or who offers too much or too little information, you will quickly los e interest in the conversation. Writers, too, need to be clear, s tay on the topic, and give information appropriately. In fact, this attention to audience and appr opriateness may be even more important in writing than in conversation because writing does not permit the nonverbal communication and immediate feedback that are part of conver sation. As writers, we have to ; in effect, we have to imagine both halves of a virtual conversation. [3점]",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R33",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 33,
    "category": "reading",
    "type": "고난도 킬러 빈칸추론",
    "title": "[2026년 수능 고3] 33번 고난도 킬러 빈칸추론",
    "script": null,
    "passage": "while in progress is a key to professional success. Similarly, involving prospective building us ers as well as clients is even more valuable in the long run. S a y y o u r c l i e n t i s a l a r g e corporation, such as a health care provider. While the hospital administration may serve as your client, no doubt the perspectives of administration personnel will differ significantly from those of doctors, interns, residents, nurses, and other medical staff who use the building regularly. In addition, the experiences of patients and visitors who use the building irregularly, often a s a result of life-threatening emergencies, are altogether different as well. Understanding how each type of user experiences the current medical environment as well as how each reacts to your prospective designs inevitably produces a better building. People are likely to be more sa tisfied with a new building or addition if they . For a large institution, this can translate into increased productivity on the job, reduced absenteeism, less turnover, and lower costs.",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R34",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 34,
    "category": "reading",
    "type": "초고난도 킬러 빈칸추론",
    "title": "[2026년 수능 고3] 34번 초고난도 킬러 빈칸추론",
    "script": null,
    "passage": "ultimate guarantee, not only of security and peace, but also of freedom. He believed that human societies were moving towards more rational forms regulated by effective and binding legal frameworks because on ly such frameworks enabled people to live in harmony, to prosper and to co-operate. However, his belief in inevitable progress was not based on an optimistic or high-minded view of human nature. On the contrary, it comes close to Hobbes's outlook: man's violent and conflict-prone nature makes it necessary to establish and maintain an effective legal framework in order to secure peace. We cannot count on people's benevolence or goodwill, but even 'a nation of devils' can live in harmony in a legal system that binds every citizen equally. Ideally, the law is the embodiment of those political principles that all ra tional beings would freely choose. If such laws forbid th em to do something that they would not rationally choose to do anyway, then the law cannot be . [3점] * benevolence: 자비심",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R37",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 37,
    "category": "reading",
    "type": "글의 순서 배열 (고난도)",
    "title": "[2026년 수능 고3] 37번 글의 순서 배열 (고난도)",
    "script": null,
    "passage": "Philosophy allows us to ask much broader questions than many other scientific disciplines. It is capable of looking at the bigger picture and providing important insights into the relationships between different areas of knowledge. (A) This means that while philosophy can provide valuable insights into theoretical con cepts and broader ethical questions, it needs to be supplemented by empirical findings and experiments to reach a more comprehensive understanding. (B) Philosophers tend to ask questions rather than provide definitive answers, and their contributions often consist of challenging established assu mptions and proposing new research approaches. However, for a more comprehensive understanding of the natur e of consciousness, close collaboration between philoso phy and neuroscience is required. (C) Philosophy is particularly important for the interdisciplinary efforts of cognitive science, w here it helps to bridge gaps between different disciplines a n d p i o n e e r n e w w a y s f o r research. Unlike scientific m ethods, philosophizing is a non-empirical approach that a ttempts to validate concepts through logical thinking and argumentation. [3점] * empirical: 경험의",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  },
  {
    "id": "2026-수능-고3-R40",
    "year": "2026",
    "exam": "수능",
    "grade": "고3",
    "qNumber": 40,
    "category": "reading",
    "type": "문단 요약문 완성",
    "title": "[2026년 수능 고3] 40번 문단 요약문 완성",
    "script": null,
    "passage": "(B)에 들어갈 말로 가장 적절한 것은? In modern societies, the performing arts form a distinct category of public entertainme nt in opposition to the mass distribution through the media of expertly staged performances which have b een recorded and edited. By contrast, theater, ballet, circus, concert, rodeo, storytelling , etc., unfold their signs in real space and time, and engage audiences who respond cognitively and emotionally on the spot. Performers and audiences are involved in shared enjoyment. But sometimes fru stration occurs within the boundaries of such ritualistic e vents. In industrialized and computerized cultures, the performing arts become economically unstable becaus e the institutions which sustain them increasingly depend on public and corporate funding. However, they retain their power of fascination for large, if not massive audiences, who prize the experiential, risk-loaded and one-time eve nt quality they afford. In traditional and local cultures, performances still survive and provide their audiences w ith a unique fulfillment in smaller scale, economically sustainable institutional settings. * ritualistic: 의식의 󰀻 In a situation of financial (A) due to reliance on external funding, the performing arts, which provide unique and live experiences, (B) audiences who value those experiences. (A) (B)",
    "words": [],
    "cefrLevel": "B2~C1",
    "lexile": "1220L",
    "suggestedActivities": [
      "reading",
      "writing",
      "read-write"
    ]
  }
];
