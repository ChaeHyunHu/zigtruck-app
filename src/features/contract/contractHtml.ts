import type { ContractInfo } from "@/src/features/contract/types";
import {
  formatAdditionalConditionsHtml,
  formatContractAmountMan,
  formatContractCompletedDate,
  formatContractDisplayDate,
  formatContractTradingLine,
} from "@/src/features/contract/contractFormat";

const cell = "border:1px solid #000;padding:8px;";
const th = `${cell}text-align:center;`;
const thLeft = `${cell}text-align:left;`;

function signImg(url?: string) {
  if (!url) return "";
  return `<img src="${url}" alt="서명" style="max-width:80px;max-height:20px;margin-left:4px;" />`;
}

export function buildContractHtml(contract: ContractInfo) {
  const completed = contract.transfereeCompletedDate
    ? `${formatContractCompletedDate(contract.transfereeCompletedDate)} 작성 완료`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 12px 16px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; font-size: 12px; line-height: 1.4; }
  h4 { font-size: 16px; font-weight: 700; text-align: center; margin: 0 0 8px; }
  .intro { text-align: center; font-size: 12px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; border: 1px solid #000; word-break: break-all; }
  .article { display: flex; margin-bottom: 4px; }
  .article-no { width: 40px; flex-shrink: 0; }
  .completed { text-align: center; font-size: 12px; font-weight: 500; padding: 12px 0; }
</style>
</head>
<body>
  <h4>자동차 관리권 양도 양수 계약서</h4>
  <p class="intro">매도인과 매수인은 쌍방 합의하에 매매계약을 다음과 같이 체결한다.</p>
  <table>
    <tr><th colspan="7" style="${thLeft}">1.매매할 자동차의 표시</th></tr>
    <tr>
      <th style="${th}">차량번호</th>
      <td colspan="2" style="${cell}">${contract.carNumber ?? ""}</td>
      <th style="${th}">차종</th>
      <td colspan="3" style="${cell}">${contract.carType ?? ""}</td>
    </tr>
    <tr>
      <th style="${th}">용도</th>
      <td colspan="2" style="${cell}">${contract.carUse ?? ""}</td>
      <th style="${th}">차명</th>
      <td colspan="3" style="${cell}">${contract.carName ?? ""}</td>
    </tr>
    <tr>
      <th style="${th}">연식</th>
      <td colspan="2" style="${cell}">${contract.year ?? ""}</td>
      <th style="${th}">원동기<br/>형식</th>
      <td colspan="3" style="${cell}">${contract.motorType ?? ""}</td>
    </tr>
    <tr>
      <th style="${th}">차대번호</th>
      <td colspan="6" style="${cell}">${contract.identificationNumber ?? ""}</td>
    </tr>
    <tr><th colspan="7" style="${thLeft}">2.계약내용(약정사항)</th></tr>
    <tr><th colspan="7" style="${thLeft}">제 1조 위 자동차를 매매함에 있어 매매 금액을 아래와 같이 지불하기로 한다.</th></tr>
    <tr>
      <th style="${th}">매매금액</th>
      <td colspan="6" style="${cell}">${formatContractTradingLine(contract.tradingAmount)}</td>
    </tr>
    <tr>
      <th style="${th}">계약금</th>
      <td colspan="6" style="${cell}">一金 <strong>${formatContractAmountMan(contract.downPayment)}</strong> 정은 ${formatContractDisplayDate(contract.downPaymentDate)} 계약시 지불하고</td>
    </tr>
    <tr>
      <th style="${th}">중도금</th>
      <td colspan="6" style="${cell}">一金 <strong>${formatContractAmountMan(contract.intermediatePayment)}</strong> 정은 ${formatContractDisplayDate(contract.intermediatePaymentDate)} 계약시 지불한다</td>
    </tr>
    <tr>
      <th style="${th}">잔금</th>
      <td colspan="6" style="${cell}">一金 <strong>${formatContractAmountMan(contract.balance)}</strong> 정은 ${formatContractDisplayDate(contract.balancePaymentDate)} 계약시 지불한다</td>
    </tr>
    <tr>
      <td colspan="7" style="${cell}line-height:24px;">
        <div class="article"><span class="article-no">제2조</span><span>(당사자 표시) 매도인을 “갑”이라 하고 매수인을 “을”이라 한다.</span></div>
        <div class="article"><span class="article-no">제3조</span><span>(동시이행등) “갑”은 잔금수령과 상환으로 자동차와 소유권 이전등록에 필요한 서류를 “을”에게 인도한다. 영업용 차량일 경우 매수인은 지입회사의 규정에 준하여 위수탁관리 계약을 체결한다.</span></div>
        <div class="article"><span class="article-no">제4조</span><span>(공과금부담) 이 자동차에 대한 제세공과금은 자동차 인도일을 기준으로 하여 그 기준일까지의 분은 “갑”이 부담하고 기준일의 다음날부터의 분은 “을”이 부담한다.</span></div>
        <div class="article"><span class="article-no">제5조</span><span>(하자담보책임) “을”은 이 자동차를 인수한 후에는 이 자동차의 고장 또는 불량 등의 사유로 “갑”에게 그 책임을 물을 수 없다.</span></div>
        <div class="article"><span class="article-no">제6조</span><span>(사고책임) “을”은 이 자동차를 인수한 때부터 발생하는 모든 사고에 대하여 자기를 위하여 운행하는 자로서의 책임을 진다.</span></div>
        <div class="article"><span class="article-no">제7조</span><span>(법률상의 하자책임) 자동차인도일 이전에 발생한 행정처분 또는 이전 등록요건의 불비 기타행정상의 하자에 대하여는 “갑”이 그 책임을 진다.</span></div>
        <div class="article"><span class="article-no">제8조</span><span>(등록지체책임) “을”이 이 매매 목적물을 인수한 후 소정의 기일안에 이전등록을 하지 아니할 때에는 이에 대한 모든 책임을 “을”이 진다.</span></div>
        <div class="article"><span class="article-no">제9조</span><span>(할부승계특약) “갑”이 자동차를 할부로 구입하여 할부금을 완납하지 않은 상태에서 “을”에게 양도하는 경우에는 잔여할부금을 “을”이 승계하여 부담할 것인지의 여부를 특약사항란에 기재하여야 한다.</span></div>
        <div class="article"><span class="article-no">제10조</span><span>(위약금) 매도인이 위약시는 위약금조로 계약금의 배역을 배상하기로 하고 매수인이 위약시는 위약금조로 계약금을 포기하기로 한다.</span></div>
        <div class="article"><span class="article-no">제11조</span><span>(잔금불이행책임) 잔금 약속 불이행시 당 차량을 포기한다.</span></div>
      </td>
    </tr>
    <tr>
      <td colspan="7" style="${cell}line-height:24px;">
        <span style="display:block;padding-bottom:8px;">특약사항</span>
        매도인, 매수인 쌍방의 매매계약서로 충분히 유효하며,<br/>
        [자동차등록규칙] 제33조제2항제1호에 따라 이 양도증명서를 작성함.<br/>
        ${formatAdditionalConditionsHtml(contract.additionalConditions)}
      </td>
    </tr>
    <tr>
      <td colspan="7" style="${cell}line-height:16px;">
        * 대면을 통하지 않고 전자 계약 작성을 하는 위험성에 대해 인지하고 있음을 확인합니다.<br/>
        * (주)직트럭은 계약서 양식만 제공하므로 당사자간 거래에는 관여 및 책임지지 않습니다.
      </td>
    </tr>
    <tr>
      <th rowspan="4" style="${th}">(갑)<br/>매도인</th>
      <td colspan="2" style="${cell}">주소</td>
      <td colspan="4" style="${cell}">${contract.transferorAddress ?? ""}</td>
    </tr>
    <tr>
      <td colspan="2" style="${cell}">성명</td>
      <td colspan="4" style="${cell}">${contract.transferorName ?? ""}${signImg(contract.transferorSignImageUrl)}</td>
    </tr>
    <tr>
      <td colspan="2" style="${cell}">전화</td>
      <td colspan="4" style="${cell}">${contract.transferorPhoneNumber ?? ""}</td>
    </tr>
    <tr>
      <td colspan="2" style="${cell}">주민등록번호(사업자번호)</td>
      <td colspan="4" style="${cell}">${contract.transferorRegistrationNumber ?? ""}</td>
    </tr>
    <tr>
      <th rowspan="4" style="${th}">(을)<br/>매수인</th>
      <td colspan="2" style="${cell}">주소</td>
      <td colspan="4" style="${cell}">${contract.transfereeAddress ?? ""}</td>
    </tr>
    <tr>
      <td colspan="2" style="${cell}">성명</td>
      <td colspan="4" style="${cell}">${contract.transfereeName ?? ""}${signImg(contract.transfereeSignImageUrl)}</td>
    </tr>
    <tr>
      <td colspan="2" style="${cell}">전화</td>
      <td colspan="4" style="${cell}">${contract.transfereePhoneNumber ?? ""}</td>
    </tr>
    <tr>
      <td colspan="2" style="${cell}">주민등록번호(사업자번호)</td>
      <td colspan="4" style="${cell}">${contract.transfereeRegistrationNumber ?? ""}</td>
    </tr>
  </table>
  ${completed ? `<div class="completed">${completed}</div>` : ""}
</body>
</html>`;
}
