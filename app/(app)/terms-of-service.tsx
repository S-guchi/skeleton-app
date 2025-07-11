import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalization } from "@/lib/hooks/useLocalization";
import { Card } from "@/components/ui/Card";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TermsOfServiceScreen() {
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
            {t('terms.title')}
          </Text>
          <View className="w-16" />
        </View>
      </View>

      {/* コンテンツ */}
      <ScrollView className="flex-1">
        <View className="px-5 py-6">
          <Card className="p-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              利用規約
            </Text>
            
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              この利用規約（以下，「本規約」といいます。）は，うさこ家事共有アプリ（以下，「当運営者」といいます。）がこのアプリ上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。
            </Text>

            {/* 第1条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第1条（適用）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. 本規約は，ユーザーと当運営者との間の本サービスの利用に関わる一切の関係に適用されるものとします。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                2. 当運営者は本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                3. 本規約の規定が個別規定の規定と矛盾する場合には，個別規定の規定が優先されるものとします。
              </Text>
            </View>

            {/* 第2条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第2条（利用登録）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. 登録希望者が本規約に同意の上、当運営者の定める方法によって利用登録を申請し、当運営者がこれを承認することで利用登録が完了します。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                2. 当運営者は以下のいずれかに該当する場合、利用登録を承認しないことがあり、その理由の開示義務を負いません。
              </Text>
              <View className="ml-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 虚偽の内容で登録した場合
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 本規約に違反したことがある者の申請である場合
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  • その他、当運営者が不適当と判断した場合
                </Text>
              </View>
            </View>

            {/* 第3条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第3条（ユーザーIDおよびパスワードの管理）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. ユーザーは自己の責任において、IDおよびパスワードを管理してください。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                2. ユーザーは、第三者にID・パスワードを譲渡・貸与・共有することはできません。ログインされた場合、当該ユーザーによる利用とみなします。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                3. 第三者による利用で生じた損害について、当運営者は故意または重大な過失がない限り責任を負いません。
              </Text>
            </View>

            {/* 第4条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第4条（利用料金および支払方法）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. ユーザーは有料サービスの対価を、当運営者が指定する方法により支払うものとします。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                2. 支払が遅れた場合は年14.6％の遅延損害金を支払うものとします。
              </Text>
            </View>

            {/* 第5条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第5条（禁止事項）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                ユーザーは以下の行為をしてはなりません：
              </Text>
              <View className="ml-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 法令・公序良俗に違反する行為
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 犯罪に関わる行為
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 知的財産権の侵害
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • ネットワーク等への妨害行為
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 商業利用目的での情報使用
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • サービスの運営妨害行為
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 不正アクセスや個人情報の収集
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • なりすましや宣伝行為
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 異性との出会いを目的とした行為
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 反社会的勢力への利益供与
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  • その他、不適切と判断される行為
                </Text>
              </View>
            </View>

            {/* 第6条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第6条（本サービスの提供の停止等）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                当運営者は以下の場合、通知なくサービスの一部または全部を停止できます：
              </Text>
              <View className="ml-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • システムの保守点検
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 自然災害などの不可抗力
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 通信事故
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • その他、運営が困難と判断した場合
                </Text>
              </View>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                当運営者はこれによる損害に責任を負いません。
              </Text>
            </View>

            {/* 第7条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第7条（利用制限および登録抹消）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                以下の場合、通知なく利用制限または登録抹消ができます：
              </Text>
              <View className="ml-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 規約違反
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 虚偽情報の登録
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 支払い遅延
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 連絡不通
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 長期間の未利用
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • その他、利用不適当と判断された場合
                </Text>
              </View>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                これによる損害に対して、当運営者は責任を負いません。
              </Text>
            </View>

            {/* 第8条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第8条（退会）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                ユーザーは、定められた手続きにより退会できます。
              </Text>
            </View>

            {/* 第9条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第9条（保証の否認および免責事項）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. 本サービスの完全性や正確性などを保証しません。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                2. サービスに起因する損害について一切の責任を負いません。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                3. 消費者契約に該当する場合、この免責は適用されませんが、特別損害については責任を負いません。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                4. 他ユーザーや第三者との紛争にも責任を負いません。
              </Text>
            </View>

            {/* 第10条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第10条（サービス内容の変更等）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                当運営者は通知なくサービス内容を変更・中止でき、損害の責任を負いません。
              </Text>
            </View>

            {/* 第11条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第11条（利用規約の変更）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                通知なく本規約を変更でき、変更後のサービス利用をもって同意とみなします。
              </Text>
            </View>

            {/* 第12条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第12条（個人情報の取扱い）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                取得する個人情報は「プライバシーポリシー」に従って取り扱います。
              </Text>
            </View>

            {/* 第13条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第13条（通知または連絡）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                通知・連絡は当運営者の定める方法で行い、登録連絡先への通知は有効とみなします。
              </Text>
            </View>

            {/* 第14条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第14条（権利義務の譲渡の禁止）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                ユーザーは当運営者の承諾なく、契約上の地位や権利義務を第三者に譲渡・担保提供できません。
              </Text>
            </View>

            {/* 第15条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第15条（準拠法・裁判管轄）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                1. 本規約の準拠法は日本法とします。
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                2. 紛争の際は、当運営者の本店所在地を管轄する裁判所を専属的合意管轄とします。
              </Text>
            </View>

            {/* 第16条 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                第16条（アプリケーション）
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                当運営者アプリにおけるキャンペーンは当運営者独自のものであり、米Appleとは一切関係ありません。
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