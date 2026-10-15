'use strict';
/* Tab 1 (Preparation): response team and contacts, communication plan, notification obligations. */
(function () {
  const { $, button } = U;
  let ctx, refresh = [];
  const hoursAfter = (base, h) => { const d = new Date(base); return base && Number.isFinite(Number(h)) && h !== '' && !Number.isNaN(d.getTime()) ? new Date(d.getTime() + Number(h) * 3600000) : null; };

  IW.modules.push({
    name: 'Prepare',
    init(c) {
      ctx = c;
      refresh = [U.bindField(ctx, 'ppPlan', () => ctx.S.preparation, 'communication_plan'), U.bindField(ctx, 'ppScope', () => ctx.S.preparation, 'scope')];
      $('pcAdd').addEventListener('click', () => {
        const name = U.txt($('pcName').value); if (!name) { ctx.status('Enter the contact name.', 'bad'); return; }
        ctx.S.contacts.push({ id: U.uid(), name, role: $('pcRole').value, organization: U.txt($('pcOrg').value), contact: U.txt($('pcMethod').value), notify_when: U.txt($('pcWhen').value) });
        U.clear('pcName', 'pcOrg', 'pcMethod', 'pcWhen'); ctx.changed(`Contact "${name}" added.`);
      });
      $('poAdd').addEventListener('click', () => {
        const name = U.txt($('poName').value); if (!name) { ctx.status('Describe the obligation.', 'bad'); return; }
        ctx.S.obligations.push({ id: U.uid(), name, authority: U.txt($('poAuthority').value), deadline_hours: U.txt($('poHours').value), trigger: U.txt($('poTrigger').value), applies: 'To be determined' });
        U.clear('poName', 'poAuthority', 'poHours', 'poTrigger'); ctx.changed('Obligation added. Track it in 7.1.');
      });
    },
    render() {
      const S = ctx.S; refresh.forEach((f) => f());
      $('pcList').replaceChildren(U.table(['Name', 'Role', 'Organization', 'Contact details', 'Notify when', ''], S.contacts.map((x) => [x.name, x.role, x.organization, x.contact, x.notify_when,
        button('Remove', 'danger small', () => { S.contacts.splice(S.contacts.indexOf(x), 1); ctx.changed('Contact removed.'); })]), 'No contacts yet.'));
      $('poList').replaceChildren(U.table(['Obligation', 'Authority', 'Deadline', 'Applies when', 'Applies to this case?', ''], S.obligations.map((o) => {
        const due = hoursAfter(S.case.discovered, o.deadline_hours);
        return [o.name, o.authority, o.deadline_hours ? `${o.deadline_hours} h${due ? ' → ' + due.toLocaleString() : ' after discovery'}` : 'None stated', o.trigger,
          U.statusSelect(ctx, o, 'applies', ['To be determined', 'Yes', 'No']),
          button('Remove', 'danger small', () => { S.obligations.splice(S.obligations.indexOf(o), 1); ctx.changed('Obligation removed.'); })];
      }), 'No obligations recorded.'));
    },
    hoursAfter
  });
  window.IWDeadline = hoursAfter;
})();
