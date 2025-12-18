const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yptegzzukymqotzchgnp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdGVnenp1a3ltcW90emNoZ25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDU1MTYsImV4cCI6MjA3OTQyMTUxNn0.iKWkVYwlKrSBlJKUxRebbGRcgvprzkcyAOgDaCHKLSY';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// Raw schedule text from AirReserve
const rawText = `2039P7ZZA 2025/12/09(火) 10:00 2026/03/10(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
209M5823S 2025/12/09(火) 09:59 2026/03/05(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
20QLPUT8C 2025/12/13(土) 17:20 2026/02/28(土) 20:00～21:00 山根 ヤマネ A room レンタル 予約確定
209QGLMG4 2025/12/13(土) 17:19 2026/02/28(土) 09:00～20:00 山根 ヤマネ A room レンタル 予約確定
2112BGQEC 2025/12/09(火) 10:00 2026/02/24(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
2000BW2XJ 2025/12/13(土) 17:19 2026/02/21(土) 20:00～21:00 山根 ヤマネ A room レンタル 予約確定
211JEW1W8 2025/12/13(土) 17:18 2026/02/21(土) 09:00～20:00 山根 ヤマネ A room レンタル 予約確定
2123BALY8 2025/12/09(火) 09:58 2026/02/19(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
21QUS7CDN 2025/12/13(土) 17:18 2026/02/14(土) 20:00～21:00 山根 ヤマネ A room レンタル 予約確定
20ZJ73NZN 2025/12/13(土) 17:17 2026/02/14(土) 09:00～20:00 山根 ヤマネ A room レンタル 予約確定
21T0WX3R2 2025/12/09(火) 10:01 2026/02/10(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
218J4P8F2 2025/12/13(土) 17:17 2026/02/07(土) 20:00～21:00 山根 ヤマネ A room レンタル 予約確定
20M5UA1MS 2025/12/13(土) 17:17 2026/02/07(土) 09:00～20:00 山根 ヤマネ A room レンタル 予約確定
200GTZY9E 2025/12/09(火) 09:58 2026/02/05(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
20U1A63E0 2025/11/22(土) 20:04 2026/01/31(土) 17:00～21:00 山根 ヤマネ A room レンタル 予約確定
212UWFTEQ 2025/11/26(水) 09:54 2026/01/31(土) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
207B03LHE 2025/11/22(土) 20:03 2026/01/31(土) 09:00～14:00 山根 ヤマネ A room レンタル 予約確定
20Z11KFHJ 2025/12/06(土) 11:46 2026/01/31(土) 09:00～11:00 - ヒダカ B room レンタル 予約確定
20K76YM92 2025/10/28(火) 15:23 2026/01/30(金) 15:00～20:00 大塚 オオツカ A room レンタル 予約確定
21QNF2KZA 2025/12/09(火) 13:40 2026/01/30(金) 10:00～15:00 - フザイ B room レンタル 予約確定
21GU4FVYC 2025/12/09(火) 13:40 2026/01/30(金) 10:00～15:00 - フザイ A room レンタル 予約確定
20H3M0YPS 2025/12/06(土) 11:49 2026/01/29(木) 18:00～21:00 - ヒダカ A room レンタル 予約確定
202G6Y9CU 2025/11/26(水) 09:53 2026/01/29(木) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
203NZDRL4 2025/10/28(火) 15:23 2026/01/28(水) 17:00～20:00 大塚 オオツカ A room レンタル 予約確定
215XH145N 2025/10/28(火) 15:23 2026/01/28(水) 13:30～14:30 大塚 オオツカ A room レンタル 予約確定
21HNWVQ0G 2025/11/26(水) 09:53 2026/01/28(水) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
20NRJKZE0 2025/10/17(金) 12:43 2026/01/27(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
20BXCREKJ 2025/12/09(火) 13:39 2026/01/26(月) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
21CY2KNJ4 2025/12/09(火) 13:40 2026/01/26(月) 10:00～15:00 - フザイ B room レンタル 予約確定
21QL88ASU 2025/12/09(火) 13:39 2026/01/26(月) 10:00～15:00 - フザイ A room レンタル 予約確定
21V5MJ5GL 2025/10/28(火) 15:22 2026/01/25(日) 15:00～17:00 大塚 オオツカ A room レンタル 予約確定
21L3H4AUQ 2025/10/28(火) 15:22 2026/01/25(日) 10:00～12:00 大塚 オオツカ A room レンタル 予約確定
20N13JBCL 2025/11/26(水) 09:54 2026/01/24(土) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
21UFED6DE 2025/10/28(火) 15:22 2026/01/23(金) 15:00～20:00 大塚 オオツカ A room レンタル 予約確定
21BKV3ZJ8 2025/12/09(火) 13:39 2026/01/23(金) 10:00～15:00 - フザイ B room レンタル 予約確定
206132U8Q 2025/12/09(火) 13:38 2026/01/23(金) 10:00～15:00 - フザイ A room レンタル 予約確定
20VBL61NQ 2025/12/06(土) 11:48 2026/01/22(木) 18:00～21:00 - ヒダカ A room レンタル 予約確定
21TS8KVPW 2025/11/26(水) 09:51 2026/01/22(木) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
10HS1URAG 2025/11/22(土) 09:55 2026/01/22(木) 13:00～17:00 坂下 文野 サカシタ フミノ A room レンタル 予約確定
219UU5NXS 2025/10/17(金) 12:41 2026/01/22(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
11RB1N9GL 2025/11/22(土) 09:56 2026/01/22(木) 10:00～13:00 坂下 文野 サカシタ フミノ B room レンタル 予約確定
21KD9ZBRJ 2025/10/28(火) 15:22 2026/01/21(水) 17:00～20:00 大塚 オオツカ A room レンタル 予約確定
213SVL6W4 2025/10/28(火) 15:21 2026/01/21(水) 13:30～14:30 大塚 オオツカ A room レンタル 予約確定
21001VX20 2025/11/26(水) 09:52 2026/01/21(水) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
20CFAFW7A 2025/11/28(金) 12:39 2026/01/20(火) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
20SRQ7M9A 2025/11/28(金) 12:39 2026/01/19(月) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
21JMRRF9J 2025/12/09(火) 13:38 2026/01/19(月) 10:00～15:00 - フザイ A room レンタル 予約確定
20U1DSQYQ 2025/12/09(火) 13:38 2026/01/19(月) 10:00～15:00 - フザイ B room レンタル 予約確定
20TEQJYEU 2025/10/28(火) 15:21 2026/01/18(日) 15:00～17:00 大塚 オオツカ A room レンタル 予約確定
20XWKXLKA 2025/10/28(火) 15:21 2026/01/18(日) 10:00～12:00 大塚 オオツカ A room レンタル 予約確定
20CYGF42C 2025/11/22(土) 20:00 2026/01/17(土) 17:00～21:00 山根 ヤマネ A room レンタル 予約確定
200QZZDRS 2025/11/26(水) 09:54 2026/01/17(土) 10:00～20:00 西本 ニシモト B room レンタル 予約確定
21N8P7HVJ 2025/11/22(土) 19:59 2026/01/17(土) 09:00～14:00 山根 ヤマネ A room レンタル 予約確定
20H0CPET2 2025/10/28(火) 15:20 2026/01/16(金) 15:00～20:00 大塚 オオツカ A room レンタル 予約確定
21BH89XVS 2025/12/12(金) 12:04 2026/01/16(金) 10:00～13:00 西本 ニシモト B room レンタル 予約確定
210HNJ2KS 2025/11/26(水) 09:51 2026/01/15(木) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
20L8E8YAL 2025/10/28(火) 15:20 2026/01/14(水) 17:00～20:00 大塚 オオツカ A room レンタル 予約確定
21GLN7QKA 2025/10/28(火) 15:20 2026/01/14(水) 13:30～14:30 大塚 オオツカ A room レンタル 予約確定
20X9LYK28 2025/11/26(水) 09:51 2026/01/14(水) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
20797Y8ZN 2025/11/28(金) 12:38 2026/01/13(火) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
21APNFLXJ 2025/10/17(金) 12:43 2026/01/13(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
212BF9MEY 2025/11/28(金) 12:38 2026/01/12(月) 17:00～21:00 西本 ニシモト A room レンタル 予約確定
10H8325A0 2025/11/12(水) 07:50 2026/01/12(月) 15:00～17:00 外囿 祥一郎 ホカゾノ シヨウイチロウ A room レンタル 予約確定
20EM9634L 2025/12/02(火) 17:00 2026/01/12(月) 15:00～17:00 西本 ニシモト B room レンタル 予約確定
21JCWPUWL 2025/12/06(土) 11:45 2026/01/12(月) 09:00～11:00 - ヒダカ B room レンタル 予約確定
109UX7GG0 2025/11/11(火) 05:47 2026/01/11(日) 17:00～19:00 外囿 祥一郎 ホカゾノ シヨウイチロウ A room レンタル 予約確定
2112ENUWC 2025/10/28(火) 15:20 2026/01/11(日) 15:00～17:00 大塚 オオツカ A room レンタル 予約確定
21F8ES1KE 2025/10/28(火) 15:19 2026/01/11(日) 10:00～12:00 大塚 オオツカ A room レンタル 予約確定
2108MR2LG 2025/12/13(土) 17:28 2026/01/10(土) 17:00～21:00 山根 ヤマネ A room レンタル 予約確定
20RSG94WL 2025/11/28(金) 12:36 2026/01/10(土) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
209KTQMN8 2025/11/22(土) 19:57 2026/01/10(土) 09:00～15:00 山根 ヤマネ A room レンタル 予約確定
20QMJKT84 2025/12/08(月) 12:04 2026/01/09(金) 16:00～19:00 西本 ニシモト B room レンタル 予約確定
20XPRYCG8 2025/10/28(火) 15:18 2026/01/09(金) 15:00～20:00 大塚 オオツカ A room レンタル 予約確定
20ZR2YHQ4 2025/12/09(火) 13:36 2026/01/09(金) 10:00～15:00 - フザイ A room レンタル 予約確定
20N2X9VFE 2025/12/09(火) 13:36 2026/01/09(金) 10:00～15:00 - フザイ B room レンタル 予約確定
21RPU4TXE 2025/12/06(土) 11:47 2026/01/08(木) 18:00～21:00 - ヒダカ A room レンタル 予約確定
218TCYNY0 2025/11/26(水) 09:50 2026/01/08(木) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
215ARYRLU 2025/10/17(金) 12:40 2026/01/08(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
210XTHVZS 2025/10/28(火) 15:18 2026/01/07(水) 17:00～20:00 大塚 オオツカ A room レンタル 予約確定
21PFQVY7J 2025/10/28(火) 15:17 2026/01/07(水) 13:30～14:30 大塚 オオツカ A room レンタル 予約確定
2187KG87S 2025/11/26(水) 09:50 2026/01/07(水) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
216TAN9KE 2025/11/28(金) 12:37 2026/01/06(火) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
21U5M1GCQ 2025/11/28(金) 12:37 2026/01/05(月) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
21021DC1E 2025/12/06(土) 11:43 2026/01/05(月) 13:30～15:30 - ヒダカ A room レンタル 予約確定
210Y64L40 2025/12/10(水) 10:01 2026/01/04(日) 16:00～21:00 - フザイ B room レンタル 予約確定
20Z056GDW 2025/12/10(水) 10:01 2026/01/04(日) 13:00～16:00 脇坂 ワキサカ B room レンタル 予約確定
21LYXT26U 2025/11/26(水) 09:49 2026/01/04(日) 10:00～13:00 - フザイ B room レンタル 予約確定
20SGHY4FS 2025/11/26(水) 09:49 2026/01/04(日) 10:00～21:00 - フザイ A room レンタル 予約確定
21NSK2MJ0 2025/11/26(水) 09:48 2026/01/03(土) 10:00～21:00 - フザイ A room レンタル 予約確定
21QSSV0EL 2025/11/26(水) 09:48 2026/01/03(土) 10:00～21:00 - フザイ B room レンタル 予約確定
2013S05VA 2025/11/26(水) 09:48 2026/01/02(金) 10:00～21:00 - フザイ A room レンタル 予約確定
20NG2DCNL 2025/11/26(水) 09:48 2026/01/02(金) 10:00～21:00 - フザイ B room レンタル 予約確定
20XFZYY40 2025/11/26(水) 09:47 2026/01/01(木) 10:00～21:00 - フザイ B room レンタル 予約確定
20NDVK3G4 2025/11/26(水) 09:47 2026/01/01(木) 10:00～21:00 - フザイ A room レンタル 予約確定
216FXJHKE 2025/11/26(水) 09:47 2025/12/31(水) 10:00～21:00 - フザイ B room レンタル 予約確定
218DYGM9J 2025/11/26(水) 09:47 2025/12/31(水) 10:00～21:00 - フザイ A room レンタル 予約確定
10AYEY6YG 2025/11/17(月) 16:49 2025/12/30(火) 15:00～18:00 義経 太一郎 ヨシツネ タイチロウ B room レンタル 予約確定
21DSVQEBS 2025/11/07(金) 23:26 2025/12/29(月) 10:00～15:00 - フザイ A room レンタル 予約確定
20NJHF048 2025/11/07(金) 23:27 2025/12/29(月) 10:00～15:00 - フザイ B room レンタル 予約確定
11STZDSLG 2025/11/24(月) 23:52 2025/12/28(日) 12:30～15:30 上本 紗也 ウエモト サヤ B room レンタル 予約確定
21SE8LM7N 2025/11/26(水) 09:56 2025/12/28(日) 12:00～18:00 西本 ニシモト A room レンタル 予約確定
200CR30PJ 2025/11/16(日) 14:42 2025/12/28(日) 10:30～12:30 西本 ニシモト B room レンタル 予約確定
20709W4FA 2025/11/07(金) 23:25 2025/12/27(土) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
21WL4814U 2025/11/16(日) 21:45 2025/12/27(土) 13:00～14:00 宮本 ミヤモト A room レンタル 予約確定
21UDV9HNG 2025/11/24(月) 17:03 2025/12/26(金) 19:00～21:00 - アキヤマ B room レンタル 予約確定
215945RBN 2025/11/25(火) 19:40 2025/12/26(金) 18:00～21:00 西本 ニシモト A room レンタル 予約確定
20L88XJGQ 2025/09/29(月) 19:58 2025/12/26(金) 16:00～18:00 宮本 ミヤモト A room レンタル 予約確定
2143Q371J 2025/11/27(木) 14:00 2025/12/26(金) 13:00～18:00 西本 ニシモト B room レンタル 予約確定
200V6AV9J 2025/11/27(木) 19:05 2025/12/25(木) 17:00～18:00 川口音出し カワグチ A room レンタル 予約確定
20EDRMMPN 2025/09/08(月) 09:42 2025/12/25(木) 15:00～21:00 西本 ニシモト B room レンタル 予約確定
11D28T1N0 2025/10/26(日) 20:09 2025/12/25(木) 13:00～17:00 坂下 文野 サカシタ フミノ A room レンタル 予約確定
10KTNR8HW 2025/10/26(日) 20:07 2025/12/25(木) 10:00～13:00 坂下 文野 サカシタ フミノ B room レンタル 予約確定
208P9FDEY 2025/12/06(土) 11:42 2025/12/25(木) 09:00～13:00 - ヒダカ A room レンタル 予約確定
21NE59272 2025/09/08(月) 09:42 2025/12/24(水) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
21J49K640 2025/11/12(水) 14:21 2025/12/24(水) 12:30～13:30 宮本 ミヤモト A room レンタル 予約確定
207Q7X776 2025/11/24(月) 11:59 2025/12/24(水) 12:00～13:00 - アキヤマ B room レンタル 予約確定
20KK0Z73E 2025/11/26(水) 09:45 2025/12/23(火) 19:30～21:30 西本 ニシモト A room レンタル 予約確定
11BPCCSV6 2025/11/16(日) 12:40 2025/12/23(火) 18:30～19:30 鈴木 瑶子 スズキ ヨウコ A room レンタル 予約確定
11S2Y1CDN 2025/11/17(月) 16:48 2025/12/23(火) 17:00～20:00 義経 太一郎 ヨシツネ タイチロウ B room レンタル 予約確定
20X5E3JNC 2025/11/26(水) 19:52 2025/12/23(火) 16:30～18:30 西本 ニシモト A room レンタル 予約確定
20RD3TJ7S 2025/11/26(水) 09:46 2025/12/23(火) 10:00～17:00 西本 ニシモト B room レンタル 予約確定
11686L6ZE 2025/12/01(月) 10:48 2025/12/22(月) 20:00～21:00 永田 仁美 ナガタ ヒトミ A room レンタル 予約確定
105SJQTFW 2025/11/29(土) 17:49 2025/12/22(月) 19:00～20:00 永田 仁美 ナガタ ヒトミ A room レンタル 予約確定
10SDTWP2Q 2025/11/25(火) 22:17 2025/12/22(月) 18:00～19:00 渡川 恵 トガワ メグミ A room レンタル 予約確定
11RPR1R8U 2025/11/17(月) 16:44 2025/12/22(月) 17:30～19:30 義経 太一郎 ヨシツネ タイチロウ B room レンタル 予約確定
207UNG9N8 2025/11/26(水) 09:45 2025/12/22(月) 15:00～18:00 西本 ニシモト A room レンタル 予約確定
20NGALQXS 2025/11/07(金) 23:23 2025/12/22(月) 10:00～15:00 - フザイ A room レンタル 予約確定
21TAVGX44 2025/11/07(金) 23:23 2025/12/22(月) 10:00～15:00 - フザイ B room レンタル 予約確定
21R08LMJ0 2025/11/26(水) 20:08 2025/12/21(日) 17:00～20:00 西本 ニシモト B room レンタル 予約確定
20DU680DW 2025/12/14(日) 17:18 2025/12/21(日) 17:00～18:00 宮本 ミヤモト A room レンタル 予約確定
21HGUVKVS 2025/12/01(月) 16:39 2025/12/21(日) 14:00～17:00 西本 ニシモト A room レンタル 予約確定
21EEFP4JU 2025/11/24(月) 17:07 2025/12/21(日) 12:00～17:00 - アキヤマ B room レンタル 予約確定
21W09Z4SC 2025/10/10(金) 22:39 2025/12/20(土) 18:00～22:00 山根 ヤマネ A room レンタル 予約確定
11TLNWNBS 2025/12/08(月) 23:10 2025/12/20(土) 17:00～18:00 渡川 恵 トガワ メグミ A room レンタル 予約確定
20JPMXXJY 2025/10/10(金) 22:39 2025/12/20(土) 09:00～13:00 山根 ヤマネ A room レンタル 予約確定
2039G6UGQ 2025/12/14(日) 22:51 2025/12/19(金) 20:00～21:00 - フザイ B room レンタル 予約確定
210MT9UUQ 2025/11/26(水) 18:10 2025/12/19(金) 19:00～20:00 - アキヤマ B room レンタル 予約確定
20UHUG8Q8 2025/12/14(日) 22:51 2025/12/19(金) 19:00～21:00 - フザイ A room レンタル 予約確定
2141A3FAG 2025/09/29(月) 19:54 2025/12/19(金) 15:00～19:00 宮本 ミヤモト A room レンタル 予約確定
205LN1ABA 2025/09/08(月) 09:50 2025/12/19(金) 14:00～19:00 西本 ニシモト B room レンタル 予約確定
21AFDKPPN 2025/11/27(木) 13:59 2025/12/19(金) 10:00～11:00 西本 ニシモト B room レンタル 予約確定
2151Y9Q9E 2025/11/17(月) 23:26 2025/12/18(木) 18:00～21:00 日高 ヒダカ B room レンタル 予約確定
21PAPXAFS 2025/11/28(金) 10:06 2025/12/18(木) 18:00～21:00 西本 ニシモト A room レンタル 予約確定
21QXS763S 2025/09/08(月) 09:35 2025/12/18(木) 13:00～18:00 - フザイ A room レンタル 予約確定
20M4AAT4L 2025/10/17(金) 12:40 2025/12/18(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
207T4HJFA 2025/10/17(金) 12:43 2025/12/18(木) 10:00～11:00 - フザイ A room レンタル 予約確定
20V5BQUKA 2025/09/08(月) 09:35 2025/12/18(木) 10:00～18:00 - フザイ B room レンタル 予約確定
207DF0DLU 2025/11/12(水) 14:20 2025/12/17(水) 20:00～21:00 - フザイ A room レンタル 予約確定
219KRTGZW 2025/11/12(水) 14:19 2025/12/17(水) 17:00～20:00 宮本 ミヤモト A room レンタル 予約確定
21B1ULCLG 2025/11/17(月) 15:27 2025/12/17(水) 16:00～17:00 宮本 ミヤモト A room レンタル 予約確定
21T474RKE 2025/11/12(水) 14:20 2025/12/17(水) 14:00～16:00 - フザイ A room レンタル 予約確定
20YKLFJMW 2025/11/12(水) 14:19 2025/12/17(水) 13:00～14:00 宮本 ミヤモト A room レンタル 予約確定
20CUGQA32 2025/09/08(月) 09:34 2025/12/17(水) 10:00～21:00 - フザイ B room レンタル 予約確定
21TD6B0U0 2025/09/08(月) 09:34 2025/12/17(水) 10:00～13:00 - フザイ A room レンタル 予約確定
21HQ4VJQQ 2025/12/14(日) 15:53 2025/12/16(火) 20:00～21:00 - フザイ B room レンタル 予約確定
1046T11DJ 2025/11/18(火) 10:20 2025/12/16(火) 17:00～20:00 義経 太一郎 ヨシツネ タイチロウ B room レンタル 予約確定
20R0QKKVA 2025/11/17(月) 18:08 2025/12/16(火) 14:00～17:00 - フザイ B room レンタル 予約確定
21813Q6XA 2025/09/08(月) 09:34 2025/12/16(火) 13:00～21:00 - フザイ A room レンタル 予約確定
204GNMB7N 2025/10/17(金) 12:42 2025/12/16(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
20EBULEWL 2025/11/29(土) 11:48 2025/12/16(火) 10:30～11:30 宮崎 ミヤザキ B room レンタル 予約確定
21TKX4NLQ 2025/11/18(火) 09:50 2025/12/16(火) 10:00～13:00 河野先生 コウノ A room レンタル 予約確定`;

async function parseAndUpdate() {
    const lines = rawText.split('\n').filter(l => l.trim());

    // Data structure: { date: { hour: { A: boolean, B: boolean } } }
    const bookings = {};

    let parsedCount = 0;
    let skippedFuzai = 0;

    lines.forEach(line => {
        // Check if line contains confirmed booking
        if (!line.includes('予約確定')) return;

        // Check if フザイ (exclude these)
        if (line.includes('フザイ')) {
            skippedFuzai++;
            return;
        }

        // Extract date in format YYYY/MM/DD(day)
        const dateRegex = /(\d{4})\/(\d{2})\/(\d{2})\([^)]+\)/g;
        const dateMatches = [...line.matchAll(dateRegex)];

        // We need the SECOND date match (first is booking date, second is service date)
        if (dateMatches.length < 2) return;

        const serviceDate = dateMatches[1][0];
        const [y, m, d] = serviceDate.split('(')[0].split('/');
        const dateKey = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

        // Only process until end of January
        if (dateKey > '2026-01-31') return;

        // Extract time range
        const timeRegex = /(\d{1,2}):(\d{2})～(\d{1,2}):(\d{2})/;
        const timeMatch = line.match(timeRegex);
        if (!timeMatch) return;

        const startHour = parseInt(timeMatch[1]);
        const endHour = parseInt(timeMatch[3]);

        // Determine which room (A or B)
        let room = null;
        if (line.includes('A room')) {
            room = 'A';
        } else if (line.includes('B room')) {
            room = 'B';
        }

        if (!room) return;

        // Mark all hours in the range as booked for this room
        for (let hour = startHour; hour < endHour; hour++) {
            if (!bookings[dateKey]) bookings[dateKey] = {};
            if (!bookings[dateKey][hour]) bookings[dateKey][hour] = { A: false, B: false };
            bookings[dateKey][hour][room] = true;
        }

        parsedCount++;
    });

    console.log(`Parsed ${parsedCount} bookings (skipped ${skippedFuzai} フザイ entries)`);

    // Generate all slots from today to Jan 31, 2026
    const startDate = new Date();
    const endDate = new Date('2026-01-31');

    // First, fetch existing slots to preserve manual edits
    const dateKeys = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dateKeys.push(d.toISOString().split('T')[0]);
    }

    const { data: existingSlots } = await client
        .from('schedule_slots')
        .select('*')
        .in('date', dateKeys);

    // Create a map of existing slots with manual edits
    const manualEdits = new Set();
    if (existingSlots) {
        existingSlots.forEach(slot => {
            // Protect slot if it has ANY manual edit:
            // - student assignment
            // - memo or booking_type
            // - manually set to unavailable (status-ng)
            if (slot.student_id || slot.memo || slot.booking_type || slot.status === 'status-ng') {
                manualEdits.add(`${slot.date}|${slot.time_code}`);
            }
        });
    }

    console.log(`Found ${manualEdits.size} manually edited slots to preserve`);

    const slots = [];
    let skippedManual = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];

        for (let hour = 8; hour <= 22; hour++) {
            const timeCode = `${hour}:00`;
            const slotKey = `${dateKey}|${timeCode}`;

            // Skip if manually edited
            if (manualEdits.has(slotKey)) {
                skippedManual++;
                continue;
            }

            let status = 'status-ok'; // Default: available

            // Check if both rooms are booked
            if (bookings[dateKey] && bookings[dateKey][hour]) {
                const { A, B } = bookings[dateKey][hour];
                if (A && B) {
                    status = 'status-online'; // Both booked -> Online only
                }
                // If only one is booked, keep status-ok (one room available)
            }

            slots.push({
                date: dateKey,
                time_code: timeCode,
                status: status,
                student_id: null,
                booking_type: null,
                memo: null
            });
        }
    }

    console.log(`Generated ${slots.length} slots (skipped ${skippedManual} manually edited)`);

    // Show sample bookings for verification
    const sampleDate = Object.keys(bookings).sort()[0];
    if (sampleDate) {
        console.log(`Sample bookings for ${sampleDate}:`, bookings[sampleDate]);
    }

    // Batch upsert
    const BATCH_SIZE = 100;
    for (let i = 0; i < slots.length; i += BATCH_SIZE) {
        const batch = slots.slice(i, i + BATCH_SIZE);
        const { error } = await client
            .from('schedule_slots')
            .upsert(batch, { onConflict: 'date,time_code' });

        if (error) {
            console.error(`Error in batch ${i}-${i + BATCH_SIZE}:`, error);
        } else {
            console.log(`✓ Batch ${i}-${i + BATCH_SIZE} updated`);
        }
    }

    console.log('✅ Schedule update complete!');
}

parseAndUpdate().catch(console.error);
