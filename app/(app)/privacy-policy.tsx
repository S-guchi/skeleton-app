import { Card } from "@/components/ui/Card";
import { useLocalization } from "@/lib/hooks/useLocalization";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <View
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center py-2 pr-4"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
            <Text className="text-base font-medium text-gray-700 dark:text-gray-300 ml-1">
              {t('common.back')}
            </Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {t('privacy.title')}
          </Text>
          <View className="w-16" />
        </View>
      </View>

      {/* コンテンツ */}
      <ScrollView className="flex-1">
        <View className="px-5 py-6">
          <Card className="p-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              プライバシーポリシー
            </Text>

            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {{APP_NAME}}（以下，「当運営者」といいます。）は，本ウェブサイト上で提供するサービス（以下,「本サービス」といいます。）における，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。
            </Text>

            {/* 第1条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第1条（個人情報）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
              </Text>
            </View>

            {/* 第2条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第2条（個人情報の収集方法）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                当運営者は，ユーザーが利用登録をする際に氏名，生年月日，住所，電話番号，メールアドレス，銀行口座番号，クレジットカード番号，運転免許証番号などの個人情報をお尋ねすることがあります。また，ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を,当運営者の提携先（情報提供元，広告主，広告配信先などを含みます。以下，｢提携先｣といいます。）などから収集することがあります。
              </Text>
            </View>

            {/* 第3条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第3条（個人情報を収集・利用する目的）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                当運営者が個人情報を収集・利用する目的は，以下のとおりです。
              </Text>
              <View className="ml-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  1. 当運営者サービスの提供・運営のため
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  2. ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  3. ユーザーが利用中のサービスの新機能，更新情報，キャンペーン等及び当運営者が提供する他のサービスの案内のメールを送付するため
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  4. メンテナンス，重要なお知らせなど必要に応じたご連絡のため
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  5. 利用規約に違反したユーザーや，不正・不当な目的でサービスを利用しようとするユーザーの特定をし，ご利用をお断りするため
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  6. ユーザーにご自身の登録情報の閲覧や変更，削除，ご利用状況の閲覧を行っていただくため
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  7. 有料サービスにおいて，ユーザーに利用料金を請求するため
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  8. 上記の利用目的に付随する目的
                </Text>
              </View>
            </View>

            {/* 第4条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第4条（利用目的の変更）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. 当運営者は，利用目的が変更前と関連性を有すると合理的に認められる場合に限り，個人情報の利用目的を変更するものとします。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                2. 利用目的の変更を行った場合には，変更後の目的について，当運営者所定の方法により，ユーザーに通知し，または本ウェブサイト上に公表するものとします。
              </Text>
            </View>

            {/* 第5条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第5条（個人情報の第三者提供）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. 当運営者は，次に掲げる場合を除いて，あらかじめユーザーの同意を得ることなく，第三者に個人情報を提供することはありません。ただし，個人情報保護法その他の法令で認められる場合を除きます。
              </Text>
              <View className="ml-4 mb-3">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 人の生命，身体または財産の保護のために必要がある場合であって，本人の同意を得ることが困難であるとき
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって，本人の同意を得ることが困難であるとき
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって，本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
                </Text>
              </View>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                2. 前項の定めにかかわらず，次に掲げる場合には，当該情報の提供先は第三者に該当しないものとします。
              </Text>
            </View>

            {/* 第6条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第6条（個人情報の開示）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. 当運営者は，本人から個人情報の開示を求められたときは，本人に対し，遅滞なくこれを開示します。ただし，開示することにより次のいずれかに該当する場合は，その全部または一部を開示しないこともあり，その場合には遅滞なく通知します。なお，個人情報の開示に際しては，1件あたり1,000円の手数料を申し受けます。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                2. 前項の定めにかかわらず，履歴情報および特性情報などの個人情報以外の情報については，原則として開示いたしません。
              </Text>
            </View>

            {/* 第7条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第7条（個人情報の訂正および削除）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. ユーザーは，当運営者の保有する自己の個人情報が誤った情報である場合には，当運営者が定める手続きにより，当運営者に対して個人情報の訂正，追加または削除（以下，「訂正等」といいます。）を請求することができます。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                2. 当運営者は，その請求に応じる必要があると判断した場合には，遅滞なく訂正等を行います。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                3. 訂正等を行った場合，または訂正等を行わない決定をしたときは，遅滞なくユーザーに通知します。
              </Text>
            </View>

            {/* 第8条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第8条（個人情報の利用停止等）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. ユーザーから，個人情報が利用目的の範囲を超えて取り扱われている等の理由で利用停止または消去を求められた場合には，遅滞なく調査を行います。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                2. 必要と判断された場合には，遅滞なく利用停止等を行います。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                3. 利用停止等を行った場合，または行わない決定をしたときは，遅滞なくユーザーに通知します。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                4. 利用停止等が困難な場合には，ユーザーの権利利益を保護するために代替措置を講じます。
              </Text>
            </View>

            {/* 第9条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第9条（プライバシーポリシーの変更）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. 法令その他の定めを除いて，ユーザーへの通知なく変更することができます。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                2. 変更後のポリシーは本ウェブサイトに掲載した時点から効力を生じます。
              </Text>
            </View>

            {/* 第10条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第10条（お問い合わせ窓口）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                本ポリシーに関するお問い合わせは，下記の窓口までお願いいたします。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Eメールアドレス：haraguchi.shoya@gmail.com
              </Text>
            </View>

            <View className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                以上
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
